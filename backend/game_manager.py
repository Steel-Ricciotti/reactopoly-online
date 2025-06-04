"""
Placeholder GameManager. 
In the next iteration, we’ll flesh this out with real state and Monopoly logic.
"""

import uuid

class GameManager:
    def __init__(self):
        # Maps game_id (str) → some game state (e.g., dict or custom class)
        self.rooms: dict[str, dict] = {}

    def create_game(self) -> str:
        # Generate a short game ID
        game_id = str(uuid.uuid4())[:8]
        # Initialize empty state (we'll expand this later)
        self.rooms[game_id] = {
            "game_id": game_id,
            "players": {},    # will map player_id → player info
            "state": {},      # placeholder for game-specific state
        }
        return game_id

    def add_player(self, game_id: str, player_name: str, sid: str) -> str:
        room = self.rooms.get(game_id)
        if room is None:
            raise ValueError("Invalid game_id")
        # Create a simple player object
        player_id = str(uuid.uuid4())[:6]
        room["players"][player_id] = {
            "id": player_id,
            "name": player_name,
            "sid": sid,
            # we’ll add more fields (position, money, etc.) later
        }
        return player_id

    def roll_dice(self, game_id: str, player_id: str) -> tuple[int, int]:
        # Dummy dice: always 1,1 for now—just to test the flow
        return 1, 1

    # Additional methods (buy_property, build_house, end_turn, etc.) come in Iter 2.
