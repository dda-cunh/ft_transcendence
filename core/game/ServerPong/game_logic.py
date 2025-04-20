import random
import math

from ServerPong.game_utils import *

def check_goal(old_ball: Point2D,
               new_ball: Point2D,
               p1_pos: Point2D,
               p2_pos: Point2D) -> bool:
    """True if the ball center has crossed left or right bound."""
    return (new_ball.x < LEFT_BOUND) or (new_ball.x > RIGHT_BOUND)


def do_player_action(action: KeyState,
                     curr: Point2D) -> Point2D:
    """Move paddle up/down, clamped so it never leaves the screen."""
    half_ph = PADDLE_HEIGHT / 2
    min_y = BOTTOM_BOUND + half_ph
    max_y = TOP_BOUND    - half_ph

    if action == KeyState.UP:
        return Point2D(curr.x, min(max_y, curr.y + PADDLE_SPEED))
    elif action == KeyState.DOWN:
        return Point2D(curr.x, max(min_y, curr.y - PADDLE_SPEED))
    else:
        return curr


def do_ball_move(ball_pos: Point2D,
                 ball_vec: Vec2D,
                 p1_pos: Point2D,
                 p2_pos: Point2D) -> Point2D:
    """Advance the ball, handle wall bounces and paddle collisions."""
    # 1) Step forward
    next_pos = ball_vec.apply_to_point(ball_pos)
    radius = BALL_SIZE / 2

    # 2) Bounce off top/bottom
    if next_pos.y + radius > TOP_BOUND:
        next_pos.y = TOP_BOUND - radius
        ball_vec.y *= -1
    elif next_pos.y - radius < BOTTOM_BOUND:
        next_pos.y = BOTTOM_BOUND + radius
        ball_vec.y *= -1

    # 3) Left‐paddle collision?
    left_edge  = p1_pos.x + PADDLE_WIDTH/2
    top_p1     = p1_pos.y + PADDLE_HEIGHT/2
    bottom_p1  = p1_pos.y - PADDLE_HEIGHT/2

    if next_pos.x - radius < left_edge \
       and bottom_p1 < next_pos.y < top_p1:
        # push outside paddle
        next_pos.x   = left_edge + radius
        ball_vec.x  *= -1

        # optional “spin” by hit location
        rel = (next_pos.y - p1_pos.y) / (PADDLE_HEIGHT / 2)
        ball_vec.y += rel * 0.5

    # 4) Right‐paddle collision?
    right_edge = p2_pos.x - PADDLE_WIDTH/2
    top_p2     = p2_pos.y + PADDLE_HEIGHT/2
    bottom_p2  = p2_pos.y - PADDLE_HEIGHT/2

    if next_pos.x + radius > right_edge \
       and bottom_p2 < next_pos.y < top_p2:
        next_pos.x   = right_edge - radius
        ball_vec.x  *= -1

        rel = (next_pos.y - p2_pos.y) / (PADDLE_HEIGHT / 2)
        ball_vec.y += rel * 0.5

    # 5) keep speed constant
    pixels_per_tick = BASE_SPEED_PPS / TICKS_PER_SECOND
    ball_vec.normalize().scale(pixels_per_tick)
    return next_pos


def get_next_frame(old: GameState,
                   actions: PlayersActions) -> GameState:
    new = GameState(
        # move the paddles
        p1_pos   = do_player_action(actions.p1_key_scale, old.p1_pos),
        p2_pos   = do_player_action(actions.p2_key_scale, old.p2_pos),
        p1_score = old.p1_score,
        p2_score = old.p2_score,
        ball_pos = old.ball_pos,
        ball_vec = Vec2D(old.ball_vec.x, old.ball_vec.y)
    )

    # serve if stationary
    if new.ball_vec.x == 0 and new.ball_vec.y == 0:
        angle = random.uniform(-1, 1)
        new.ball_vec = Vec2D(math.cos(angle), math.sin(angle))

    pixels_per_tick = BASE_SPEED_PPS / TICKS_PER_SECOND
    new.ball_vec.normalize().scale(pixels_per_tick)

    # move & collide
    new.ball_pos = do_ball_move(old.ball_pos,
                                new.ball_vec,
                                new.p1_pos,
                                new.p2_pos)

    # check goal
    if check_goal(old.ball_pos,
                  new.ball_pos,
                  new.p1_pos,
                  new.p2_pos):
        # who gets the point?
        if new.ball_pos.x > 0:
            new.p1_score += 1
        else:
            new.p2_score += 1

        # reset ball to center
        new.ball_pos = Point2D(0, 0)
        new.ball_vec = Vec2D(0, 0)

    return new

def do_test(max_frames=10_000):
    """
    Simple random-play harness—but using our CENTERED coordinate system.
    """
    p1_start  = Point2D(P1_START_X, P1_START_Y)
    p2_start  = Point2D(P2_START_X, P2_START_Y)
    ball_start= Point2D(0, 0)

    for frame in range(max_frames):
        actions = PlayersActions(
            random.choice(list(KeyState)),
            random.choice(list(KeyState)),
        )

        state = get_next_frame(state, actions)

        print(
            f"[{frame:04d}]  "
            f"P1@({state.p1_pos.x:.1f},{state.p1_pos.y:.1f})  "
            f"P2@({state.p2_pos.x:.1f},{state.p2_pos.y:.1f})  "
            f"BALL@({state.ball_pos.x:.1f},{state.ball_pos.y:.1f})  "
            f"Score={state.p1_score}-{state.p2_score}"
        )

        if state.p1_score >= SCORE_TO_WIN or state.p2_score >= SCORE_TO_WIN:
            print("🏁 Game Over!")
            break