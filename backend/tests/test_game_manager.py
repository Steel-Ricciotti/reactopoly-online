import pytest
from game_manager import GameManager

@pytest.fixture
def gm():
    return GameManager()

def test_create_game_initializes_room(gm):
    game_id = gm.create_game()
    assert isinstance(game_id, str) and len(game_id) == 8
    assert game_id in gm.rooms
    room = gm.rooms[game_id]
    assert room["players"] == {}
    assert room["state"] == {}

def test_add_player_success(gm):
    game_id = gm.create_game()
    player_id = gm.add_player(game_id, "Alice", "SID123")
    room = gm.rooms[game_id]
    assert player_id in room["players"]
    player = room["players"][player_id]
    assert player["name"] == "Alice"
    assert player["sid"] == "SID123"

def test_add_player_invalid_game(gm):
    with pytest.raises(ValueError):
        gm.add_player("nonexistent", "Bob", "SID456")

def test_roll_dice_dummy(gm):
    game_id = gm.create_game()
    player_id = gm.add_player(game_id, "Eve", "SID789")
    # Dummy dice always return (1, 1)
    die1, die2 = gm.roll_dice(game_id, player_id)
    assert (die1, die2) == (1, 1)


def test_turn_order_and_roll(gm):
    game_id = gm.create_game()
    # Add two players
    p1 = gm.add_player(game_id, "Alice", "SID1")
    p2 = gm.add_player(game_id, "Bob", "SID2")

    state1 = gm._snapshot(gm.rooms[game_id])
    assert state1["currentTurn"] == p1  # Alice goes first

    # Alice rolls (1,1), moves from 0→2, still not passing GO
    snapshot = gm.roll_and_move(game_id, p1)
    alice_info = snapshot["players"][p1]
    assert alice_info["position"] == 2
    assert alice_info["money"] == STARTING_CASH  # no GO bonus yet

    # Turn should now be Bob’s
    assert snapshot["currentTurn"] == p2

    # If Bob rolls enough to pass GO:
    # Force Bob’s position close to BOARD_SIZE − 1
    room = gm.rooms[game_id]
    room["players"][p2]["position"] = BOARD_SIZE - 2  # position 38
    # Next dice sum= 2 (we can monkeypatch if needed, but the test can just call roll_and_move repeatedly)
    # For determinism, override random to always return 1:
    import random
    random.randint = lambda a, b: 1

    snapshot2 = gm.roll_and_move(game_id, p2)
    bob_info = snapshot2["players"][p2]
    # 38 + (1+1) = 40 → wraps to 0, gets PASS_GO_CASH
    assert bob_info["position"] == 0
    assert bob_info["money"] == STARTING_CASH + PASS_GO_CASH
    