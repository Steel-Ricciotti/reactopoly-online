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
        if player["inJail"]:
            raise PermissionError("You are in jail and cannot roll")
        player["inJail"] = True
        new_pos = 10
        player["position"] = new_pos
        print("Go to jail test 4")
        return self._snapshot(room)
