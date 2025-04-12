import httpx
import json

from dataclasses import dataclass

@dataclass
class AsyncGetData:
	status: int
	headers: dict
	body: bytes
	json: json
	exception: bool

async def asyncGet(url: str, headers: dict) -> AsyncGetData:
	async with httpx.AsyncClient() as client:
		try:
			response = await client.get(url, headers=headers)
			return (AsyncGetData(response.status_code, response.headers, \
					response.content, response.json, False))
		except httpx.RequestError as exc:
			return (AsyncGetData(500, {}, str(exc), {}, True))
