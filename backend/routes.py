from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from schemas import TopicRequest, CognitiveMapResponse, FusionRequest
from prompt import get_prompt, get_fusion_prompt
from llm_client import get_llm_client
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/generate-map", response_model=CognitiveMapResponse)
async def generate_map(request: TopicRequest):
    """
    Generate a cognitive map for the given topic.
    """
    try:
        if not request.topic or not request.topic.strip():
            raise HTTPException(status_code=400, detail="Topic cannot be empty")
        
        topic = request.topic.strip()
        complexity = request.complexity or "intermediate"
        logger.info(f"Generating cognitive map for topic: {topic} (complexity: {complexity})")
        
        # Generate prompt
        prompt = get_prompt(topic, complexity)
        
        # Call LLM
        llm_client = get_llm_client()
        response_data = await llm_client.generate_cognitive_map(prompt)
        
        logger.info(f"LLM response keys: {list(response_data.keys())}")
        logger.info(f"Has graph_nodes: {'graph_nodes' in response_data}")
        logger.info(f"Has graph_links: {'graph_links' in response_data}")
        
        # Ensure graph_nodes exists and is valid
        if 'graph_nodes' not in response_data or not response_data.get('graph_nodes'):
            logger.warning("No graph_nodes in response, generating from lists")
            # Generate nodes from the lists
            nodes = []
            links = []
            
            # Core node
            nodes.append({
                'id': 'core',
                'type': 'core',
                'label': response_data.get('core_idea', topic)[:50] if isinstance(response_data.get('core_idea'), str) else topic,
                'description': response_data.get('core_idea', f"The core concept of {topic}")
            })
            
            # Sub-ideas
            for i, sub_idea in enumerate(response_data.get('sub_ideas', [])[:10]):
                node_id = f'sub_{i+1}'
                nodes.append({
                    'id': node_id,
                    'type': 'sub',
                    'label': sub_idea[:50] if isinstance(sub_idea, str) else f"Sub-idea {i+1}",
                    'description': sub_idea if isinstance(sub_idea, str) else f"A sub-concept of {topic}"
                })
                links.append({'source': 'core', 'target': node_id})
            
            # Contradictions
            for i, contradiction in enumerate(response_data.get('contradictions', [])[:8]):
                node_id = f'contradiction_{i+1}'
                nodes.append({
                    'id': node_id,
                    'type': 'contradiction',
                    'label': contradiction[:50] if isinstance(contradiction, str) else f"Contradiction {i+1}",
                    'description': contradiction if isinstance(contradiction, str) else f"A contradiction related to {topic}"
                })
                # Link to first sub-idea if available
                if len(nodes) > 1:
                    links.append({'source': 'sub_1', 'target': node_id})
                else:
                    links.append({'source': 'core', 'target': node_id})
            
            # Adjacent fields
            for i, adjacent in enumerate(response_data.get('adjacent_fields', [])[:8]):
                node_id = f'adjacent_{i+1}'
                nodes.append({
                    'id': node_id,
                    'type': 'adjacent',
                    'label': adjacent[:50] if isinstance(adjacent, str) else f"Adjacent field {i+1}",
                    'description': adjacent if isinstance(adjacent, str) else f"An adjacent field related to {topic}"
                })
                links.append({'source': 'core', 'target': node_id})
            
            # Examples
            for i, example in enumerate(response_data.get('real_world_examples', [])[:8]):
                node_id = f'example_{i+1}'
                nodes.append({
                    'id': node_id,
                    'type': 'example',
                    'label': example[:50] if isinstance(example, str) else f"Example {i+1}",
                    'description': example if isinstance(example, str) else f"A real-world example of {topic}"
                })
                # Link to first sub-idea if available
                if len(nodes) > 1:
                    links.append({'source': 'sub_1', 'target': node_id})
                else:
                    links.append({'source': 'core', 'target': node_id})
            
            response_data['graph_nodes'] = nodes
            response_data['graph_links'] = links
            logger.info(f"Generated {len(nodes)} nodes and {len(links)} links")
        
        # Ensure all nodes have descriptions
        if 'graph_nodes' in response_data and response_data['graph_nodes']:
            for node in response_data['graph_nodes']:
                if 'description' not in node or not node.get('description'):
                    node['description'] = f"This {node.get('type', 'node')} represents: {node.get('label', '')}"
                # Ensure required fields
                if 'id' not in node:
                    node['id'] = f"node_{response_data['graph_nodes'].index(node)}"
                if 'type' not in node:
                    node['type'] = 'sub'
                if 'label' not in node:
                    node['label'] = 'Unnamed Node'
        
        # Ensure graph_links exists
        if 'graph_links' not in response_data or not response_data.get('graph_links'):
            logger.warning("No graph_links in response, generating minimal links")
            response_data['graph_links'] = []
            # Create links from core to first few nodes
            if response_data.get('graph_nodes'):
                for i, node in enumerate(response_data['graph_nodes'][1:6]):  # Link first 5 nodes to core
                    response_data['graph_links'].append({
                        'source': response_data['graph_nodes'][0]['id'],
                        'target': node['id']
                    })
        
        # Ensure reasoning_trail exists
        if 'reasoning_trail' not in response_data or not response_data.get('reasoning_trail'):
            response_data['reasoning_trail'] = "This cognitive map explores the relationships and connections within the topic, showing how different concepts relate to each other."
        
        logger.info(f"Final response: {len(response_data.get('graph_nodes', []))} nodes, {len(response_data.get('graph_links', []))} links")
        
        # Validate and return
        return CognitiveMapResponse(**response_data)
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        logger.error(f"LLM error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate cognitive map: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.post("/fusion-map", response_model=CognitiveMapResponse)
async def generate_fusion_map(request: FusionRequest):
    """
    Generate a fusion cognitive map for two topics.
    """
    try:
        if not request.topic_a or not request.topic_a.strip():
            raise HTTPException(status_code=400, detail="Topic A cannot be empty")
        if not request.topic_b or not request.topic_b.strip():
            raise HTTPException(status_code=400, detail="Topic B cannot be empty")
        
        topic_a = request.topic_a.strip()
        topic_b = request.topic_b.strip()
        complexity = request.complexity or "intermediate"
        logger.info(f"Generating fusion map for topics: {topic_a} & {topic_b} (complexity: {complexity})")
        
        # Generate prompt
        prompt = get_fusion_prompt(topic_a, topic_b, complexity)
        
        # Call LLM
        llm_client = get_llm_client()
        response_data = await llm_client.generate_cognitive_map(prompt)
        
        logger.info(f"Fusion LLM response keys: {list(response_data.keys())}")
        
        # Ensure graph_nodes exists and is valid (same logic as generate_map)
        if 'graph_nodes' not in response_data or not response_data.get('graph_nodes'):
            logger.warning("No graph_nodes in fusion response, generating from lists")
            nodes = []
            links = []
            
            nodes.append({
                'id': 'core',
                'type': 'core',
                'label': response_data.get('core_idea', f"{topic_a} & {topic_b}")[:50],
                'description': response_data.get('core_idea', f"Fusion of {topic_a} and {topic_b}")
            })
            
            for i, sub_idea in enumerate(response_data.get('sub_ideas', [])[:10]):
                node_id = f'sub_{i+1}'
                nodes.append({
                    'id': node_id,
                    'type': 'sub',
                    'label': sub_idea[:50] if isinstance(sub_idea, str) else f"Sub-idea {i+1}",
                    'description': sub_idea if isinstance(sub_idea, str) else f"A sub-concept"
                })
                links.append({'source': 'core', 'target': node_id})
            
            for i, contradiction in enumerate(response_data.get('contradictions', [])[:8]):
                node_id = f'contradiction_{i+1}'
                nodes.append({
                    'id': node_id,
                    'type': 'contradiction',
                    'label': contradiction[:50] if isinstance(contradiction, str) else f"Contradiction {i+1}",
                    'description': contradiction if isinstance(contradiction, str) else f"A contradiction"
                })
                links.append({'source': 'sub_1' if len(nodes) > 1 else 'core', 'target': node_id})
            
            for i, adjacent in enumerate(response_data.get('adjacent_fields', [])[:8]):
                node_id = f'adjacent_{i+1}'
                nodes.append({
                    'id': node_id,
                    'type': 'adjacent',
                    'label': adjacent[:50] if isinstance(adjacent, str) else f"Adjacent {i+1}",
                    'description': adjacent if isinstance(adjacent, str) else f"An adjacent field"
                })
                links.append({'source': 'core', 'target': node_id})
            
            for i, example in enumerate(response_data.get('real_world_examples', [])[:8]):
                node_id = f'example_{i+1}'
                nodes.append({
                    'id': node_id,
                    'type': 'example',
                    'label': example[:50] if isinstance(example, str) else f"Example {i+1}",
                    'description': example if isinstance(example, str) else f"A real-world example"
                })
                links.append({'source': 'sub_1' if len(nodes) > 1 else 'core', 'target': node_id})
            
            response_data['graph_nodes'] = nodes
            response_data['graph_links'] = links
        
        # Ensure all nodes have descriptions
        if 'graph_nodes' in response_data and response_data['graph_nodes']:
            for node in response_data['graph_nodes']:
                if 'description' not in node or not node.get('description'):
                    node['description'] = f"This {node.get('type', 'node')} represents: {node.get('label', '')}"
                if 'id' not in node:
                    node['id'] = f"node_{response_data['graph_nodes'].index(node)}"
                if 'type' not in node:
                    node['type'] = 'sub'
                if 'label' not in node:
                    node['label'] = 'Unnamed Node'
        
        # Ensure graph_links exists
        if 'graph_links' not in response_data or not response_data.get('graph_links'):
            response_data['graph_links'] = []
            if response_data.get('graph_nodes'):
                for i, node in enumerate(response_data['graph_nodes'][1:6]):
                    response_data['graph_links'].append({
                        'source': response_data['graph_nodes'][0]['id'],
                        'target': node['id']
                    })
        
        # Ensure reasoning_trail exists
        if 'reasoning_trail' not in response_data or not response_data.get('reasoning_trail'):
            response_data['reasoning_trail'] = f"This fusion map explores the intersections and relationships between {topic_a} and {topic_b}, highlighting connections and contradictions."
        
        # Validate and return
        return CognitiveMapResponse(**response_data)
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        logger.error(f"LLM error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate fusion map: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.post("/export/pdf")
async def export_pdf(data: dict):
    """
    Export cognitive map as PDF (placeholder - requires additional library).
    """
    # This is a placeholder - in production, use libraries like reportlab or weasyprint
    return {"message": "PDF export feature - to be implemented with reportlab/weasyprint", "data": data}

