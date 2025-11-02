from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List
from langgraph.graph import StateGraph, END

# LangChain imports
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.agents import initialize_agent, Tool
from langchain.agents import AgentType
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser
from langchain_community.vectorstores import FAISS

app = FastAPI(title="LangGraph Workflow Runner")


# ------------------------------
# Pydantic Models for Validation
# ------------------------------
class Node(BaseModel):
    id: str
    type: str
    name: str


class Edge(BaseModel):
    source: str
    target: str


class Prompt(BaseModel):
    prompt: str
    system_prompt: str

class WorkflowRequest(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    prompt: Prompt


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


def llm_node(state, params=None):
    """A node that calls an LLM with tools using LangChain AgentExecutor."""

    if params is None:
        params = {}

    model_name = params.get("model", "gpt-4o-mini")
    temperature = params.get("temperature", 0)

    llm = ChatOpenAI(model=model_name, temperature=temperature)

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = FAISS.from_texts(["hello world", "langchain is cool"], embeddings)
    retriever = vectorstore.as_retriever()

    prompt = ChatPromptTemplate.from_messages([
        ("system", "Answer the question based on the context:\n{context}"),
        ("human", "{question}")
    ])

    rag_chain = (
            {"context": retriever, "question": lambda x: x["question"]}
            | prompt
            | llm
            | StrOutputParser()
    )

    result = rag_chain.invoke(input="hello")
    messages = state["messages"]
    state["messages"] = messages + result
    return {"messages": messages}


NODE_REGISTRY = {
    "echo": echo_node,
    "uppercase": uppercase_node,
}


# ------------------------------
# Workflow Builder
# ------------------------------
def build_workflow(nodes: List[Node], edges: List[Edge]):
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
