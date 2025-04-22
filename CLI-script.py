# cli_pong.py
import asyncio
import curses
import json
import websockets
import sys
import ssl

if len(sys.argv) > 1:
    JWT_TOKEN = sys.argv[1]
else:
    print("Usage: python cli_pong.py <jwt_token>")
    sys.exit(1)
WS_URL = "wss://localhost/ws/remotepong/"

async def play(stdscr):
    curses.cbreak()
    stdscr.nodelay(True)
    stdscr.clear()
    try:
        async with websockets.connect(
            WS_URL,
            extra_headers={"Authorization": f"Bearer {JWT_TOKEN}"},
            ssl=ssl._create_unverified_context(),
        ) as websocket:
            async def send_input():
                try:
                    while True:
                        key = stdscr.getch()
                        if key == ord('w'):
                            await websocket.send(json.dumps({"keystate": "DOWN"}))
                        elif key == ord('s'):
                            await websocket.send(json.dumps({"keystate": "UP"}))
                        elif key == -1:
                            await websocket.send(json.dumps({"keystate": "IDLE"}))
                        await asyncio.sleep(0.05)
                except websockets.exceptions.ConnectionClosed:
                    return

            async def receive_updates():
                try:
                    while True:
                        message = await websocket.recv()
                        data = json.loads(message)
                        if "message" in data:
                            stdscr.addstr(0, 0, message)
                        if "visual" in data:
                            visual = data.get("visual")
                            for i, line in enumerate(visual.split("\n")):
                                if i >= curses.LINES:
                                    break
                                stdscr.addstr(i, 0, line[:curses.COLS - 1])
                        stdscr.refresh()
                except Exception as e:
                    stdscr.clear()
                    stdscr.addstr(0, 0, f"Receive Error: {str(e)}")
                    stdscr.refresh()
                    await asyncio.sleep(2)

            await asyncio.gather(send_input(), receive_updates())
    except Exception as e:
        stdscr.clear()
        stdscr.addstr(0, 0, f"Connection Error: {str(e)}")
        stdscr.refresh()
        await asyncio.sleep(2)

if __name__ == "__main__":
    curses.wrapper(lambda stdscr: asyncio.run(play(stdscr)))
