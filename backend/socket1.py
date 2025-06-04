# backend/socket_handlers.py
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
        # (Later: handle removing players / marking bankrupt)

    @sio.event
    async def create_game(sid, data):
        game_id = gm.create_game()
        logger.debug(f"[create_game] new game {game_id}")
        await sio.emit("game_created", {"game_id": game_id}, to=sid)

    @sio.event
    async def join_game(sid, data):
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

        # Put this socket in the room
        await sio.enter_room(sid, game_id)

        # Broadcast to everyone: a new player joined
        await sio.emit(
            "player_joined",
            {"player_id": player_id, "player_name": player_name},
            room=game_id
        )

        # Additionally, send the full game state so clients know initial turn/order
        state = gm._snapshot(gm.rooms[game_id])
        await sio.emit("state_update", state, room=game_id)

    @sio.event
    async def roll_dice(sid, data):
        game_id = data.get("game_id")
        player_id = data.get("player_id")
        if not game_id or not player_id:
            await sio.emit("error", {"message": "Missing game_id or player_id"}, to=sid)
            return
        try:
            # Perform roll & move (may raise PermissionError or ValueError)
            new_state = gm.roll_and_move(game_id, player_id)
        except PermissionError as e:
            # e.g. “not your turn” or “in jail”
            await sio.emit("error", {"message": str(e)}, to=sid)
            return
        except ValueError as e:
            await sio.emit("error", {"message": str(e)}, to=sid)
            return

        # Broadcast the updated game state to everyone
        await sio.emit("state_update", new_state, room=game_id)
