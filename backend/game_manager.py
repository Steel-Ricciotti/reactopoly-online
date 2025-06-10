# backend/game_manager.py
import random
import uuid
from typing import Optional

# NOTE: Add the 'group' field to each property if you want house logic to work!
PROPERTY_DATA = {
    1:  ("Mediterranean Avenue", 60, 6, "brown"),
    3:  ("Baltic Avenue", 60, 6, "brown"),
    5:  ("Reading Railroad", 200, 50, "rail"),
    6:  ("Oriental Avenue", 100, 6, "light-blue"),
    8:  ("Vermont Avenue", 100, 14, "light-blue"),
    9:  ("Connecticut Avenue", 120, 14, "light-blue"),
    12: ("Electric Company", 75, 15, "utility"),
    13: ("States Avenue", 140, 14, "pink"),
    14: ("Virginia Avenue", 160, 14, "pink"),
    15: ("Pennsylvania Railroad", 200, 50, "rail"),
    16: ("St. James Place", 180, 20, "orange"),
    18: ("Tennessee Avenue", 180, 22, "orange"),
    19: ("New York Avenue", 200, 26, "orange"),
    21: ("Kentucky Avenue", 220, 26, "red"),
    23: ("Indiana Avenue", 220, 28, "red"),
    24: ("Illinois Avenue", 240, 28, "red"),
    25: ("B&O Railroad", 200, 50, "rail"),
    26: ("Atlantic Avenue", 260, 32, "yellow"),
    27: ("Ventnor Avenue", 260, 28, "yellow"),
    28: ("Water Works", 75, 15, "utility"),
    29: ("Marvin Gardens", 280, 32, "yellow"),
    31: ("Pacific Avenue", 300, 32, "green"),
    32: ("North Carolina Avenue", 300, 34, "green"),
    34: ("Pennsylvania Avenue", 320, 28, "green"),
    35: ("Short Line", 200, 50, "rail"),
    37: ("Park Place", 350, 35, "blue"),
    39: ("Boardwalk", 400, 50, "blue"),
}

BOARD_SIZE = 40
PASS_GO_CASH = 200
STARTING_CASH = 1500
COMMUNITY_CHEST_CARDS  = [
    {
        "id": 1,
        "text": "Advance to Go (Collect $200)",
        "action": "advance_to_go"
    },
    {
        "id": 2,
        "text": "Bank error in your favor. Collect $200.",
        "action": "collect_money",
        "amount": 200
    },
    {
        "id": 3,
        "text": "Doctor's fees. Pay $50.",
        "action": "pay_money",
        "amount": 50
    },
    {
        "id": 4,
        "text": "Go to Jail. Go directly to jail, do not pass Go, do not collect $200.",
        "action": "go_to_jail"
    },]

# COMMUNITY_CHEST_CARDS  = [
#     {
#         "id": 4,
#         "text": "Go to Jail. Go directly to jail, do not pass Go, do not collect $200.",
#         "action": "go_to_jail"
#     },
# ]

CHANCE_CARDS = [
    {
        "id": 1,
        "text": "Go back 3 spaces.",
        "action": "move_relative",
        "amount": -3
    },
    {
        "id": 2,
        "text": "Advance to Illinois Ave.",
        "action": "move_to",
        "destination": 24
    },
    # ...add more cards...
]
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
            "properties": {},     # property_index → { owner, houses, hotel }
            "diceOne": 6,
            "diceTwo": 3,
        }
        for idx in PROPERTY_DATA:
            self.rooms[game_id]["properties"][idx] = {
                "owner": None,
                "houses": 0,
                "hotel": False
            }
        return game_id

    def buy_house(self, game_id, player_id, group_name):
        room = self.rooms[game_id]
        # Find eligible properties in the group
        group_props = [idx for idx, pdata in PROPERTY_DATA.items() if pdata[3] == group_name]
        # Ensure the player owns all properties in the group
        if not all(room['properties'][idx]['owner'] == player_id for idx in group_props):
            raise ValueError("Player does not own all properties in the group.")
        # Find properties with less than 4 houses/hotel, by position order
        for idx in sorted(group_props):
            prop = room['properties'][idx]
            if prop['houses'] < 4 and not prop['hotel']:
                prop['houses'] += 1
                # TODO: Deduct cash here (add cost logic)
                break
            elif prop['houses'] == 4 and not prop['hotel']:
                prop['hotel'] = True
                prop['houses'] = 0
                # TODO: Deduct cash for hotel
                break
        # Return updated snapshot
        return self._snapshot(room)

    def land_on_property(self, game_id: str, player_id: str) -> dict:
        room = self.rooms[game_id]
        player = room["players"][player_id]
        pos = player["position"]

        prop_info = PROPERTY_DATA.get(pos)
        if not prop_info:
            return {"type": "not_property"}

        prop_obj = room["properties"].get(pos)
        owner_id = prop_obj["owner"] if prop_obj else None
        name, cost, base_rent, _group = prop_info

        if owner_id is None:
            return {"type": "unowned", "index": pos, "name": name, "cost": cost}
        elif owner_id == player_id:
            return {"type": "owned_by_self", "index": pos, "name": name}
        else:
            return {
                "type": "pay_rent",
                "index": pos,
                "name": name,
                "rent": base_rent,
                "owner": owner_id,
            }

    def buy_property(self, game_id: str, player_id: str) -> dict:
        room = self.rooms[game_id]
        player = room["players"][player_id]
        pos = player["position"]

        if pos not in PROPERTY_DATA:
            raise ValueError("Not a property")
        if room["properties"][pos]["owner"] is not None:
            raise ValueError("Already owned")
        name, cost, _rent, _group = PROPERTY_DATA[pos]
        if player["money"] < cost:
            raise ValueError("Insufficient funds")
        # Deduct cost and set ownership
        player["money"] -= cost
        room["properties"][pos]["owner"] = player_id
        # Return updated snapshot
        return self._snapshot(room)

    def list_open_games(self):
        return [
            {
                "game_id": game_id,
                "players": [player['name'] for player in room['players'].values()],
                "num_players": len(room["players"])
            }
            for game_id, room in self.rooms.items()
            if not room.get("started", False)
        ]

    def add_player(self, game_id: str, player_name: str, sid: str, piece: str = "🚗") -> str:
        room = self.rooms.get(game_id)
        if room is None:
            raise ValueError("Invalid game_id")
        # Create a new player
        player_id = str(uuid.uuid4())[:6]
        room["players"][player_id] = {
            "id": player_id,
            "name": player_name,
            "sid": sid,
            "position": 0,
            "money": STARTING_CASH,
            "inJail": False,
            "bankrupt": False,
            "piece": piece or "🚗"
        }
        room["playerOrder"].append(player_id)
        return player_id

    def start_game(self, game_id: str):
        room = self.rooms.get(game_id)
        if not room:
            raise ValueError("Invalid game_id")
        room["started"] = True
        room["currentIndex"] = 0  # First player gets the turn
        return self._snapshot(room)

    def _get_current_player_id(self, game_id: str) -> str:
        room = self.rooms[game_id]
        order = room["playerOrder"]
        idx = room["currentIndex"]
        n = len(order)
        for _ in range(n):
            pid = order[idx % n]
            if not room["players"][pid]["bankrupt"]:
                return pid
            idx += 1
        return order[room["currentIndex"] % n]


#Community Chest/Cards Implementation
    def get_card(self, card_type):
        if card_type == "community_chest":
            return random.choice(COMMUNITY_CHEST_CARDS)
        elif card_type == "chance":
            return random.choice(CHANCE_CARDS)
        else:
            return None

    def advance_go(self, game_id: str, player_id: str) -> dict:
        print("Test One")
        room = self.rooms.get(game_id)
        if room is None:
            raise ValueError("Invalid game_id")
        player = room["players"].get(player_id)
        old_pos = player["position"]
        if old_pos != 0:
            player["money"] += PASS_GO_CASH  # Only pay if not already on GO
        player["position"] = 0
        # Advance turn!
        self._advance_turn(room, player_id)
        print("Test Two")
        return self._snapshot(room)

    def advance(self, game_id: str, player_id: str, spaces: int) -> dict:
        room = self.rooms.get(game_id)
        if room is None:
            raise ValueError("Invalid game_id")
        player = room["players"].get(player_id)
        old_pos = player["position"]
        new_pos = (old_pos + spaces) % BOARD_SIZE
        if new_pos < old_pos:
            player["money"] += PASS_GO_CASH  # Passed GO
        player["position"] = new_pos
        # Advance turn!
        self._advance_turn(room, player_id)
        return self._snapshot(room)

    def _advance_turn(self, room, current_pid):
        order = room["playerOrder"]
        idx = order.index(current_pid)
        n = len(order)
        next_idx = (idx + 1) % n
        # Skip bankrupt
        for _ in range(n):
            next_pid = order[next_idx]
            if not room["players"][next_pid]["bankrupt"]:
                break
            next_idx = (next_idx + 1) % n
        room["currentIndex"] = next_idx

    def pay(self, game_id: str, player_id: str, amount:int) -> dict:
        room = self.rooms.get(game_id)
        player = room["players"].get(player_id)
        if room is None:
            raise ValueError("Invalid game_id")
        player["money"] -= amount
        return self._snapshot(room)

    def collect(self, game_id: str, player_id: str, amount:int) -> dict:
        room = self.rooms.get(game_id)
        player = room["players"].get(player_id)
        if room is None:
            raise ValueError("Invalid game_id")
        player["money"] += amount
        print("cOLLECTED mONDY")
        return self._snapshot(room)



    def go_to_jail(self, game_id: str, player_id: str) -> dict:
        print("Go to jail test 3")
        room = self.rooms.get(game_id)
        if room is None:
            raise ValueError("Invalid game_id")
        player = room["players"].get(player_id)
        if player is None or player["bankrupt"]:
            raise ValueError("Player invalid or bankrupt")
        current_pid = self._get_current_player_id(game_id)
        if current_pid != player_id:
            raise PermissionError("Not your turn")
        player["inJail"] = True
        player["position"] = 10

       # Determine if rent is owed
        prop_data = self.land_on_property(game_id, player_id)
        if prop_data["type"] == "pay_rent":
            rent = prop_data["rent"]
            owner_id = prop_data["owner"]
            player["money"] -= rent
            room["players"][owner_id]["money"] += rent
        order = room["playerOrder"]
        idx = order.index(player_id)
        n = len(order)
        next_idx = (idx + 1) % n
        for _ in range(n):
            next_pid = order[next_idx]
            if not room["players"][next_pid]["bankrupt"]:
                break
            next_idx = (next_idx + 1) % n
        room["currentIndex"] = next_idx
        return self._snapshot(room)


    def roll_and_move(self, game_id: str, player_id: str) -> dict:
        room = self.rooms.get(game_id)
        if room is None:
            raise ValueError("Invalid game_id")
        player = room["players"].get(player_id)
        if player is None or player["bankrupt"]:
            raise ValueError("Player invalid or bankrupt")
        current_pid = self._get_current_player_id(game_id)
        if current_pid != player_id:
            raise PermissionError("Not your turn")
        if player["inJail"]:
            raise PermissionError("You are in jail and cannot roll")
        die1 = 1#random.randint(1, 6)
        die2 = 3#random.randint(1, 6)
        room["diceOne"] = die1
        room["diceTwo"] = die2
        steps = die1 + die2
        old_pos = player["position"]
        new_pos = (old_pos + steps) % BOARD_SIZE
        if old_pos + steps >= BOARD_SIZE:
            player["money"] += PASS_GO_CASH
        player["position"] = new_pos

        # Determine if rent is owed
        prop_data = self.land_on_property(game_id, player_id)
        if prop_data["type"] == "pay_rent":
            rent = prop_data["rent"]
            owner_id = prop_data["owner"]
            player["money"] -= rent
            room["players"][owner_id]["money"] += rent
        order = room["playerOrder"]
        idx = order.index(player_id)
        n = len(order)
        next_idx = (idx + 1) % n
        for _ in range(n):
            next_pid = order[next_idx]
            if not room["players"][next_pid]["bankrupt"]:
                break
            next_idx = (next_idx + 1) % n
        room["currentIndex"] = next_idx
        return self._snapshot(room)

    def _snapshot(self, room: dict) -> dict:
        snapshot = {
            "game_id": room["game_id"],
            "playerOrder": room["playerOrder"],
            "currentTurn": self._get_current_player_id(room["game_id"]),
            "players": {},
            "properties": room["properties"],  # now owner/houses/hotel for each
            "diceOne": room["diceOne"],
            "diceTwo": room["diceTwo"]
        }
        for pid, info in room["players"].items():
            snapshot["players"][pid] = {
                "name": info["name"],
                "position": info["position"],
                "money": info["money"],
                "inJail": info["inJail"],
                "bankrupt": info["bankrupt"],
                "piece": info.get("piece", "🚗")
            }
        return snapshot
