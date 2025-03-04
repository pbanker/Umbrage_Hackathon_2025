import os
from openai import AsyncOpenAI, OpenAI

from app.config import settings

# Initialize OpenAI clients - async for embeddings, sync for completions
async_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
sync_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def get_embedding(text: str) -> list[float]:
    print("getting embedding from Open AI... String Object: ", text)
    response = await async_client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding 

async def get_formatted_completion(prompt: str, format: any, model: str = "gpt-4o-2024-08-06") -> str:
    completion = sync_client.beta.chat.completions.parse(
        model=model,
        messages=[
        {"role": "system", "content": "Based on the user's prompt, generate a response in the specified format."},
        {"role": "user", "content": prompt},
    ],
    response_format=format,
    )

    return completion.choices[0].message.parsed

def get_completion(prompt: str, model: str = "gpt-4o-2024-08-06") -> str:
    response = sync_client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content