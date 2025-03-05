import os
from openai import AsyncOpenAI, OpenAI
from typing import TypeVar, Type
from pydantic import BaseModel

async_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
sync_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

T = TypeVar('T', bound=BaseModel)

async def get_embedding(text: str) -> list[float]:
    print("getting embedding from Open AI... String Object: ", text)
    response = await async_client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding 

async def get_formatted_completion(
    system_prompt: str,
    user_prompt: str,
    format_model: Type[T],
    model: str = "gpt-4o-2024-08-06"
) -> T:
    """Get a structured completion from OpenAI"""
    completion = sync_client.beta.chat.completions.parse(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format=format_model,
    )

    return completion.choices[0].message.parsed

async def get_completion(prompt: str, system_prompt: str = "You are a helpful assistant.", model: str = "gpt-3.5-turbo") -> str:
    response = await async_client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content