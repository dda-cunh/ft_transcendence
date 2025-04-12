from channels.middleware import BaseMiddleware
import http.cookies

class JWTSubprotocolMiddleware(BaseMiddleware):
	def __init__(self, inner):
		super().__init__(inner)

	async def __call__(self, scope, receive, send):
		headers = dict(scope.get('headers', []))
		cookie = headers.get(b'cookie', None)
		access = None
		token = None
		if cookie:
			c = http.cookies.SimpleCookie(cookie.decode('utf-8'))
			access = c.get('access', [None])
		auth = headers.get(b'authorization', None)
		if access:
			token = access.value

		if not token and auth:
			token = auth.decode('utf-8')

		if token and not token.startswith("Bearer "):
			token = "Bearer " + token
		scope["token"] = token

		return await super().__call__(scope, receive, send)