# backend/game_manager.py
"""
GameManager v2: add turn order, player positions, money, and basic roll logic.
"""

import random
import uuid

BOARD_SIZE = 40
PASS_GO_CASH = 200
STARTING_CASH = 1500

class GameManager:
    def __init__(self):
        # Maps game_id (str) → game state dict
        self.rooms: dict[str, dict] = {}

    def create_game(self) -> str:
        game_id = str(uuid.uuid4())[:8]
        # Initialize a fresh game state
        self.rooms[game_id] = {
            "game_id": game_id,
            "players": {},        # player_id → { name, sid, position, money, inJail, bankrupt }
            "playerOrder": [],    # ordered list of player_ids
            "currentIndex": 0,    # index into playerOrder for whose turn it is
            # You can expand this later with property state, card decks, etc.
        }
        return game_id

    def add_player(self, game_id: str, player_name: str, sid: str) -> str:
        room = self.rooms.get(game_id)
        if room is None:
            raise ValueError("Invalid game_id")

        # Create a new player
        player_id = str(uuid.uuid4())[:6]
        room["players"][player_id] = {
            "id": player_id,
            "name": player_name,
            "sid": sid,
            "position": 0,       # all players start on GO (space 0)
            "money": STARTING_CASH,
            "inJail": False,
            "bankrupt": False,
        }
        room["playerOrder"].append(player_id)
        return player_id

    def _get_current_player_id(self, game_id: str) -> str:
        room = self.rooms[game_id]
        order = room["playerOrder"]
        idx = room["currentIndex"]
        # If the current player is bankrupt, skip forward until a non-bankrupt is found
        n = len(order)
        for _ in range(n):
            pid = order[idx % n]
            if not room["players"][pid]["bankrupt"]:
                return pid
            idx += 1
        # If everyone is bankrupt (shouldn’t happen), just return the original
        return order[room["currentIndex"] % n]

    def roll_and_move(self, game_id: str, player_id: str) -> dict:
        """
        1. Verify it’s player_id’s turn and they are not in jail.
        2. Roll two dice, update position (with wrap), pay $200 if passing GO.
        3. Advance currentIndex to next non-bankrupt player.
        4. Return the entire room state (so clients can re-render).
        """
        room = self.rooms.get(game_id)
        if room is None:
            raise ValueError("Invalid game_id")

        # Check that the caller is at least in the game and not bankrupt
        player = room["players"].get(player_id)
        if player is None or player["bankrupt"]:
            raise ValueError("Player invalid or bankrupt")

        # Check turn order
        current_pid = self._get_current_player_id(game_id)
        if current_pid != player_id:
            raise PermissionError("Not your turn")

        if player["inJail"]:
            # For now, we’ll just skip the player if they’re in jail.
            # (Later we can add logic: pay $50, roll doubles, etc.)
            raise PermissionError("You are in jail and cannot roll")

        # Roll dice
        die1 = random.randint(1, 6)
        die2 = random.randint(1, 6)
        steps = die1 + die2

        # Move position
        old_pos = player["position"]
        new_pos = (old_pos + steps) % BOARD_SIZE

        # If passed GO (old_pos + steps >= 40), pay $200
        if old_pos + steps >= BOARD_SIZE:
            player["money"] += PASS_GO_CASH

        player["position"] = new_pos

        # Advance turn to next non-bankrupt player
        # Find the index of current player in playerOrder
        order = room["playerOrder"]
        idx = order.index(player_id)
        n = len(order)
        next_idx = (idx + 1) % n

        # Skip bankrupt players
        for _ in range(n):
            next_pid = order[next_idx]
            if not room["players"][next_pid]["bankrupt"]:
                break
            next_idx = (next_idx + 1) % n

        room["currentIndex"] = next_idx

        # Return a serializable snapshot of the room’s state
        return self._snapshot(room)

    def _snapshot(self, room: dict) -> dict:
        """
        Build a JSON-friendly dict of the room state:
        playerOrder, currentTurn, and for each player: position, money, etc.
        """
        snapshot = {
            "game_id": room["game_id"],
            "playerOrder": room["playerOrder"],
            "currentTurn": self._get_current_player_id(room["game_id"]),
            "players": {},
        }
        for pid, info in room["players"].items():
            snapshot["players"][pid] = {
                "name": info["name"],
                "position": info["position"],
                "money": info["money"],
                "inJail": info["inJail"],
                "bankrupt": info["bankrupt"],
            }
        return snapshot
