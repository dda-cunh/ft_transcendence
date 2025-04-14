import random

from ServerPong.game_utils import *

def	check_goal(old_ball_pos: Point2D, ball_pos: Point2D,
				p1_pos: Point2D, p2_pos: Point2D)-> bool:#TODO:
	return (False)

def	do_player_action(action: KeyState, curr_coords: Point2D)-> Point2D:#TODO:
	if action == KeyState.UP:
		return Point2D(curr_coords.x, max(0, curr_coords.y - PADDLE_SPEED))
	elif action == KeyState.DOWN:
		return Point2D(curr_coords.x, min(CANVAS_H - PADDLE_HEIGHT, curr_coords.y + PADDLE_SPEED))
	return curr_coords

def	do_ball_move(ball_pos: Point2D, ball_vec: Vec2D,
					p1_pos: Point2D, p2_pos: Point2D)-> Point2D:#TODO:
	#Should check for colisions with walls an
	new_ball_pos = ball_vec.apply_to_point(ball_pos)
	return (new_ball_pos)

def	get_next_frame(old: GameState, actions: PlayersActions)-> GameState:
	new = GameState()
	new.p1_pos = do_player_action(actions.player_1_key_scale)
	new.p2_pos = do_player_action(actions.player_2_key_scale)
	new.ball_vec = old.ball_vec
	if (new.ball_vec.x == 0 and new.ball_vec.y == 0):
		angle = random.uniform(0, 2 * math.pi)
		new.ball_vec = Vec2D(math.cos(angle), math.sin(angle))
	new.ball_vec.normalize()
	new.ball_vec.scale(FRAME_MOVE_PX)
	new.ball_pos = do_ball_move(old.ball_pos, new.ball_vec, new.p1_pos, new.p2_pos)
	if check_goal(old.ball_pos, new.ball_pos, new.p1_pos, new.p2_pos):
		if new.ball_pos.x > CANVAS_MID_X:
			new.p1_score = old.p1_score + 1
		else:
			new.p2_score = old.p2_score + 1
	return (new)

def	do_test():
	state= GameState(Point2D(P1_START_X, P1_START_Y), Point2D(P2_START_X, P2_START_Y),
					 0, 0, Point2D(CANVAS_MID_X, CANVAS_MID_Y), Vec2D(1, 1))
	while (True):
		p1_action = random.choice(list(KeyState))
		p2_action = random.choice(list(KeyState))
		curr_state = get_next_frame(state, PlayersActions(p1_action, p2_action))
		print(curr_state)
