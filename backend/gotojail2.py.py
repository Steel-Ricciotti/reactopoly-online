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
    # Optionally allow re-jailing (depends on your game rules)
    player["inJail"] = True
    player["position"] = 10

    # ---- ADVANCE TURN HERE ----
    order = room["playerOrder"]
    idx = order.index(player_id)
    n = len(order)
    next_idx = (idx + 1) % n
    # Skip bankrupt players (just like in roll_and_move)
    for _ in range(n):
        next_pid = order[next_idx]
        if not room["players"][next_pid]["bankrupt"]:
            break
        next_idx = (next_idx + 1) % n
    room["currentIndex"] = next_idx

    print("Go to jail test 4")
    return self._snapshot(room)
