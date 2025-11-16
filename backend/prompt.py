COGNITIVE_MAP_PROMPT = """You are a cognitive mapping expert. Given a topic and complexity level, generate a comprehensive cognitive map in JSON format.

COMPLEXITY LEVELS:
- Beginner: 3-5 sub-ideas, 2-3 contradictions, 3-4 adjacent fields, 3-4 examples. Use simple language.
- Intermediate: 5-8 sub-ideas, 3-5 contradictions, 4-6 adjacent fields, 4-6 examples. Balanced depth.
- Expert: 8-12 sub-ideas, 5-7 contradictions, 6-8 adjacent fields, 6-8 examples. Deep, nuanced analysis.

The cognitive map must include:
1. Core idea: A clear, concise explanation of the main concept
2. Sub-ideas: Key sub-concepts or components that branch from the core idea (adjust count by complexity)
3. Contradictions: Opposing viewpoints, limitations, or counterarguments (adjust count by complexity)
4. Adjacent fields: Related fields or disciplines that connect to this topic (adjust count by complexity)
5. Real-world examples: Concrete examples or applications (adjust count by complexity)

CRITICAL REQUIREMENTS:
- Each graph node MUST include: id, type, label, AND description (2-3 meaningful sentences explaining the concept)
- Generate a reasoning_trail: A paragraph (4-6 sentences) explaining:
  * Why each idea was chosen
  * How nodes are connected and why
  * How contradictions arise and their significance
  * The overall structure and relationships

Graph structure:
- Nodes: Each node must have id, type (one of: "core", "sub", "contradiction", "adjacent", "example"), label, and description
- Links: Connections between nodes showing relationships (source and target node ids)
- The core idea should be the central node. Connect sub-ideas to the core, contradictions to relevant sub-ideas, adjacent fields to the core or relevant sub-ideas, and examples to relevant sub-ideas or adjacent fields.

IMPORTANT: Return ONLY valid JSON. Do not include markdown code blocks, explanations, or any other text. Just the raw JSON object.

Return ONLY valid JSON in this exact format:
{{
  "topic": "{topic}",
  "core_idea": "...",
  "sub_ideas": ["...", "..."],
  "contradictions": ["...", "..."],
  "adjacent_fields": ["...", "..."],
  "real_world_examples": ["...", "..."],
  "graph_nodes": [
    {{"id": "core", "type": "core", "label": "...", "description": "2-3 sentences explaining this core concept"}},
    {{"id": "sub1", "type": "sub", "label": "...", "description": "2-3 sentences explaining this sub-idea"}},
    ...
  ],
  "graph_links": [
    {{"source": "core", "target": "sub1"}},
    ...
  ],
  "reasoning_trail": "A paragraph (4-6 sentences) explaining the cognitive map structure, why ideas were chosen, how nodes connect, and how contradictions arise."
}}

Topic: {topic}
Complexity: {complexity}
"""

FUSION_MAP_PROMPT = """You are a cognitive mapping expert. Given two topics, generate a fusion cognitive map that explores intersections, contradictions, and relationships between them.

Create a cognitive map that:
1. Identifies overlapping concepts between the two topics
2. Highlights contradictions or tensions between them
3. Shows how they relate and influence each other
4. Includes unique aspects of each topic
5. Demonstrates synthesis and integration

Each graph node must include: id, type, label, and description (2-3 meaningful sentences).

Generate a reasoning_trail explaining the fusion process, intersections, and relationships.

Return ONLY valid JSON in this exact format:
{{
  "topic": "Fusion: {topic_a} & {topic_b}",
  "core_idea": "...",
  "sub_ideas": ["...", "..."],
  "contradictions": ["...", "..."],
  "adjacent_fields": ["...", "..."],
  "real_world_examples": ["...", "..."],
  "graph_nodes": [
    {{"id": "core", "type": "core", "label": "...", "description": "..."}},
    ...
  ],
  "graph_links": [
    {{"source": "core", "target": "sub1"}},
    ...
  ],
  "reasoning_trail": "..."
}}

Topic A: {topic_a}
Topic B: {topic_b}
Complexity: {complexity}
"""


def get_prompt(topic: str, complexity: str = "intermediate") -> str:
    """Generate the prompt for the given topic and complexity."""
    return COGNITIVE_MAP_PROMPT.format(topic=topic, complexity=complexity)


def get_fusion_prompt(topic_a: str, topic_b: str, complexity: str = "intermediate") -> str:
    """Generate the prompt for fusion map."""
    return FUSION_MAP_PROMPT.format(topic_a=topic_a, topic_b=topic_b, complexity=complexity)

