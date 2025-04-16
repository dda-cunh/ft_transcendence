import httpx
import json

from dataclasses import dataclass
from typing import Optional, Tuple

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


async def validate_user_token(scope) -> Tuple[Optional[str], Optional[str]]:
	url = 'http://auth:8000/validate'
	token = scope.get('token')

	if not token:
		return None, json.dumps({'message': "Not authenticated"})

	headers = {"Authorization": f"{token}"}
	response = await asyncGet(url, headers)

	if response.status != 200:
		return None, json.dumps({'message': "Not authenticated"})

	data = response.json()
	user_id = data['payload']['user_id']
	return user_id, None