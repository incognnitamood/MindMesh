from pydantic import BaseModel
from typing import List, Optional, Literal


class TopicRequest(BaseModel):
    topic: str
    complexity: Optional[Literal["beginner", "intermediate", "expert"]] = "intermediate"


class FusionRequest(BaseModel):
    topic_a: str
    topic_b: str
    complexity: Optional[Literal["beginner", "intermediate", "expert"]] = "intermediate"


class GraphNode(BaseModel):
    id: str
    type: str  # "core" | "sub" | "contradiction" | "adjacent" | "example"
    label: str
    description: Optional[str] = ""  # 2-3 meaningful sentences


class GraphLink(BaseModel):
    source: str
    target: str


class CognitiveMapResponse(BaseModel):
    topic: str
    core_idea: str
    sub_ideas: List[str]
    contradictions: List[str]
    adjacent_fields: List[str]
    real_world_examples: List[str]
    graph_nodes: List[GraphNode]
    graph_links: List[GraphLink]
    reasoning_trail: Optional[str] = ""  # Paragraph explaining the cognitive map structure

