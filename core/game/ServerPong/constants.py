import os

REDIS_URL = f"redis://:{os.environ['RE_PASS']}@{os.environ['RE__HOST']}:{os.environ['RE_PORT']}"
