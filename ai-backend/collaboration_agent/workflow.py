from langchain.agents import create_agent
from langchain.agents.middleware import dynamic_prompt, ModelRequest

from dataclasses import dataclass


@dataclass
class Context:
    user_role: str = "user"


@dynamic_prompt
def dynamic_prompt(request: ModelRequest) -> str:
    user_role = request.runtime.context.user_role
    base_prompt = "You are a helpful assistant."

    if user_role == "expert":
        prompt = (
            f"{base_prompt} Provide detailed technical responses."
        )
    elif user_role == "beginner":
        prompt = (
            f"{base_prompt} Explain concepts simply and avoid jargon."
        )
    else:
        prompt = base_prompt

    return prompt


def get_weather(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"


agent = create_agent(
    model="openai:gpt-4o",
    tools=[get_weather],
    middleware=[dynamic_prompt],
    context_schema=Context
)


agent.invoke(
    {"messages": [{"role": "user", "content": "Explain async programming"}]},
    context=Context(user_role="expert")
)