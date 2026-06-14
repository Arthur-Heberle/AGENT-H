from openai import AsyncOpenAI

from core.config import settings

_client = AsyncOpenAI(api_key=settings.EMBEDDING_API_KEY)


async def embed(text: str) -> list[float]:
    response = await _client.embeddings.create(
        input=text,
        model=settings.EMBEDDING_MODEL,
    )
    return response.data[0].embedding


async def embed_many(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    response = await _client.embeddings.create(
        input=texts,
        model=settings.EMBEDDING_MODEL,
    )
    # API returns items in the same order as input
    return [item.embedding for item in sorted(response.data, key=lambda x: x.index)]
