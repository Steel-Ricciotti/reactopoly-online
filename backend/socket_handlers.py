import logging
from fastapi import HTTPException

from game_manager import GameManager

logger = logging.getLogger("socketio")
logger.setLevel(logging.DEBUG)

gm = GameManager()

def register_socket_handlers(sio):
    @sio.event
    async def connect(sid, environ):
        logger.debug(f"[connect] Client connected: {sid}")

    @sio.event
    async def disconnect(sid):
        logger.debug(f"[disconnect] Client disconnected: {sid}")
        # We won’t handle cleanup yet.

    @sio.event
    async def create_game(sid, data):
        logger.debug(f"[create_game] sid={sid}, data={data}")
        game_id = gm.create_game()
        # Send back to the creator their new game ID
        await sio.emit("game_created", {"game_id": game_id}, to=sid)

    @sio.event
    async def join_game(sid, data):
        logger.debug(f"[join_game] sid={sid}, data={data}")
        game_id = data.get("game_id")
        player_name = data.get("player_name")
        if not game_id or not player_name:
            await sio.emit("error", {"message": "Missing game_id or player_name"}, to=sid)
            return
        try:
            player_id = gm.add_player(game_id, player_name, sid)
        except ValueError:
            await sio.emit("error", {"message": "Invalid game_id"}, to=sid)
            return

        # Place this client in the Socket.IO room = game_id
        await sio.enter_room(sid, game_id)
        # Notify the entire room that a new player joined
        await sio.emit("player_joined", {"player_id": player_id, "player_name": player_name}, room=game_id)

    @sio.event
    async def roll_dice(sid, data):
        logger.debug(f"[roll_dice] sid={sid}, data={data}")
        game_id = data.get("game_id")
        player_id = data.get("player_id")
        if not game_id or not player_id:
            await sio.emit("error", {"message": "Missing game_id or player_id"}, to=sid)
            return
        # For now, return dummy dice
        die1, die2 = gm.roll_dice(game_id, player_id)
        # Broadcast the dice result to everyone in the room
        await sio.emit("dice_result", {"player_id": player_id, "dice": [die1, die2]}, room=game_id)

    # In Iteration 2, we’ll add: buy_property, build_house, end_turn, etc.
