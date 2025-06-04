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
