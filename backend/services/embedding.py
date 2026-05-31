from openai import AsyncOpenAI

from core.config import settings

_client = AsyncOpenAI(api_key=settings.EMBEDDING_API_KEY)


async def embed(text: str) -> list[float]:
    response = await _client.embeddings.create(
        input=text,
        model=settings.EMBEDDING_MODEL,
    )
    return response.data[0].embedding
