# backend/game_manager.py
"""
GameManager v2: add turn order, player positions, money, and basic roll logic.
"""

import random
import uuid
from typing import Optional

PROPERTY_DATA = {
1	 ( "Mediterranean Avenue"	,	60	6	),
5	 ( "Reading Railroad"	,	200	50	),
8	 ( "Vermont Avenue"	,	120	 ,14	),
9	 ( "Connecticut Avenue"	,	140	 ,14	),
12	 ( "Electric Company"	,	75	15	),
13	 ( "States Avenue"	,	140	 ,14	),
15	 ( "Pennsylvania Railroad"	,	200	25	),
16	 ( "St. James Place"	,	160	20	),
18	 ( "Tennessee Avenue"	,	160	22	),
19	 ( "New York Avenue"	,	180	26	),
21	 ( "Kentucky Avenue"	,	200	26	),
23	 ( "Indiana Avenue"	,	220	28	),
25	 ( "B&O Railroad"	,	200	25	),
26	 ( "Atlantic Avenue"	,	300	32	),
28	 ( "Water Works"	,	75	15	),
31	 ( "Pacific Avenue"	,	340	32	),
32	 ( "North Carolina Avenue"	,	340	34	),
34	 ( "Pennsylvania Avenue"	,	200	25	),
35	 ( "Short Line"	,	200	25	),
37	 ( "Park Place"	,	340	35	),
39	 ( "Boardwalk"	,	400	50	),

}


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
            "properties": {}, 
        }
        for idx in PROPERTY_DATA:
            self.rooms[game_id]["properties"][idx] = None
        return game_id

    def land_on_property(self, game_id: str, player_id: str) -> dict:
        room = self.rooms[game_id]
        player = room["players"][player_id]
        pos = player["position"]

        prop_info = PROPERTY_DATA.get(pos)
        if not prop_info:
            return {"type": "not_property"}

        owner = room["properties"].get(pos)
        name, cost, base_rent = prop_info

        if owner is None:
            return {"type": "unowned", "index": pos, "name": name, "cost": cost}
        elif owner == player_id:
            return {"type": "owned_by_self", "index": pos, "name": name}
        else:
            return {"type": "pay_rent", "index": pos, "name": name, "rent": base_rent, "owner": owner}

    def buy_property(self, game_id: str, player_id: str) -> dict:
        room = self.rooms[game_id]
        player = room["players"][player_id]
        pos = player["position"]

        if pos not in PROPERTY_DATA:
            raise ValueError("Not a property")
        if room["properties"][pos] is not None:
            raise ValueError("Already owned")

        name, cost, _ = PROPERTY_DATA[pos]
        if player["money"] < cost:
            raise ValueError("Insufficient funds")

        # Deduct cost and set ownership
        player["money"] -= cost
        room["properties"][pos] = player_id

        # Return updated snapshot
        return self._snapshot(room)
        
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
        pos = player["position"]
        prop_data = self.land_on_property(game_id, player_id)
        if prop_data["type"] == "pay_rent":
            rent = prop_data["rent"]
            owner_id = prop_data["owner"]
            player["money"] -= rent
            room["players"][owner_id]["money"] += rent
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
