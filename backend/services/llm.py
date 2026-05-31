from openai import AsyncOpenAI

from core.config import settings

_client = AsyncOpenAI(
    api_key=settings.LLM_API_KEY,
    base_url=settings.LLM_BASE_URL,
)


async def chat(messages: list[dict]) -> str:
    response = await _client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=messages,
    )
    return response.choices[0].message.content
