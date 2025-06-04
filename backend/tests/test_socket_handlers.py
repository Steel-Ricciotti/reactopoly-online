import asyncio
import pytest
import socketio

from socket_handlers import register_socket_handlers
from fastapi import FastAPI
from fastapi.testclient import TestClient
import uvicorn

# Create a FastAPI app with Socket.IO mounted
app = FastAPI()
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
asgi_app = socketio.ASGIApp(sio, other_asgi_app=app)
register_socket_handlers(sio)
test_client = TestClient(asgi_app)

@pytest.mark.asyncio
async def test_create_and_join_game(monkeypatch):
    # Use python-socketio AsyncClient for testing
    client1 = socketio.AsyncClient()
    client2 = socketio.AsyncClient()

    await client1.connect("http://localhost:8000", transports=["websocket"])
    # Listen for game_created
    create_future = asyncio.get_event_loop().create_future()
    @client1.on("game_created")
    def on_game_created(data):
        if not create_future.done():
            create_future.set_result(data["game_id"])

    await client1.emit("create_game", {})
    game_id = await asyncio.wait_for(create_future, timeout=2.0)
    assert isinstance(game_id, str)

    # Now have client2 join using that game_id
    join_future = asyncio.get_event_loop().create_future()
    @client2.on("player_joined")
    def on_player_joined(data):
        if not join_future.done():
            join_future.set_result(data)

    await client2.connect("http://localhost:8000", transports=["websocket"])
    await client2.emit("join_game", {"game_id": game_id, "player_name": "Bob"})
    result = await asyncio.wait_for(join_future, timeout=2.0)
    assert result["player_name"] == "Bob"

    await client1.disconnect()
    await client2.disconnect()

@pytest.mark.asyncio
async def test_join_invalid_game_returns_error():
    client = socketio.AsyncClient()
    await client.connect("http://localhost:8000", transports=["websocket"])
    future_err = asyncio.get_event_loop().create_future()

    @client.on("error")
    def on_error(data):
        if not future_err.done():
            future_err.set_result(data["message"])

    await client.emit("join_game", {"game_id": "badid", "player_name": "Carol"})
    err_msg = await asyncio.wait_for(future_err, timeout=2.0)
    assert "Invalid game_id" in err_msg

    await client.disconnect()
