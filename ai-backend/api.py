from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List
from langgraph.graph import StateGraph, END

app = FastAPI(title="LangGraph Workflow Runner")

# ------------------------------
# Pydantic Models for Validation
# ------------------------------
class NodeConfig(BaseModel):
    id: str
    type: str
    params: Dict[str, Any] = {}

class EdgeConfig(BaseModel):
    source: str
    target: str

class WorkflowRequest(BaseModel):
    nodes: List[NodeConfig]
    edges: List[EdgeConfig]
    initial_state: Dict[str, Any] = {}

# ------------------------------
# Example: Node Function Registry
# ------------------------------
# In real life you'd have more complex functions/tools
def echo_node(state, params=None):
    """A node that just echoes input state."""
    return {"messages": state.get("messages", []) + [params.get("text", "no text")]}

def uppercase_node(state, params=None):
    """Uppercase last message."""
    messages = state.get("messages", [])
    if messages:
        last = messages[-1].upper()
        messages[-1] = last
    return {"messages": messages}

NODE_REGISTRY = {
    "echo": echo_node,
    "uppercase": uppercase_node,
}

# ------------------------------
# Workflow Builder
# ------------------------------
def build_workflow(nodes: List[NodeConfig], edges: List[EdgeConfig]):
    # Define a simple shared state
    class WorkflowState(BaseModel):
        messages: List[str]

    graph = StateGraph(WorkflowState)

    # Add nodes
    for node in nodes:
        if node.type not in NODE_REGISTRY:
            raise ValueError(f"Unknown node type: {node.type}")

        fn = lambda state, params=node.params, fn=NODE_REGISTRY[node.type]: fn(state, params)
        graph.add_node(node.id, fn)

    # Add edges
    for edge in edges:
        target = END if edge.target == "END" else edge.target
        graph.add_edge(edge.source, target)

    # Pick first node as entry point
    if nodes:
        graph.set_entry_point(nodes[0].id)

    return graph.compile()

# ------------------------------
# API Endpoints
# ------------------------------
@app.post("/run-workflow")
async def run_workflow(workflow: WorkflowRequest):
    try:
        compiled = build_workflow(workflow.nodes, workflow.edges)
        result = compiled.invoke(workflow.initial_state or {})
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
