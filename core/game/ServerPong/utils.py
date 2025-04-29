import httpx
import json

from dataclasses import dataclass
from typing import Optional, Tuple
from ServerPong.redis_utils import get_user_mode, set_user_mode, is_user_in_queue

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

async def validate_mode(user_id, mode, resp) -> Tuple[Optional[str]]:
	if not get_user_mode(user_id):
		set_user_mode(user_id, mode)
	elif get_user_mode(user_id) != mode:
		return json.dumps({'message': f"subscribed to {resp} mode. Rejecting..."})
	elif get_user_mode(user_id) == mode and is_user_in_queue(user_id, mode):
		return json.dumps({'message': "already in queue"})
	return None

def	validate_tname(tname: str)-> bool:
	from user.models import validate_username
	try:
		validate_username(tname)
	except:
		return (False)
	return (True)
