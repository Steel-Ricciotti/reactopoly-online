# backend/socket_handlers.py
import logging
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

        await sio.enter_room(sid, game_id)
        await sio.emit(
            "player_joined",
            {"player_id": player_id, "player_name": player_name},
            room=game_id
        )

        # Emit initial game state
        state = gm._snapshot(gm.rooms[game_id])
        logger.debug(f"[join_game] Emitting state_update for {game_id}: {state}")
        await sio.emit("state_update", state, room=game_id)

    @sio.event
    async def roll_dice(sid, data):
        game_id = data.get("game_id")
        player_id = data.get("player_id")
        if not game_id or not player_id:
            await sio.emit("error", {"message": "Missing game_id or player_id"}, to=sid)
            return
        try:
            new_state = gm.roll_and_move(game_id, player_id)
        except PermissionError as e:
            await sio.emit("error", {"message": str(e)}, to=sid)
            return
        except ValueError as e:
            await sio.emit("error", {"message": str(e)}, to=sid)
            return

        logger.debug(f"[roll_dice] Emitting state_update for {game_id}: {new_state}")
        await sio.emit("state_update", new_state, room=game_id)

    @sio.event
    async def buy_property(sid, data):
        game_id = data.get("game_id")
        player_id = data.get("player_id")
        print("Buying property")
        if not game_id:
            print("No Game Id")
        if not player_id:
            print("No Player Id")            
        if not game_id or not player_id:
            
            await sio.emit("error", {"message": "Missing game_id or player_id"}, to=sid)
            return
        try:
            print("Trying to buy")
            new_state = gm.buy_property(game_id, player_id)
        except ValueError as e:
            print("Buy Gailed")
            await sio.emit("error", {"message": str(e)}, to=sid)
            return
        print("Buying property")
        logger.debug(f"[buy_property] Emitting state_update for {game_id}: {new_state}")
        await sio.emit("state_update", new_state, room=game_id)
