import os
import uvicorn
import socketio
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from socket_handlers import register_socket_handlers

fastapi_app = FastAPI()
fastapi_app.mount(
    "/",
    StaticFiles(directory=os.path.join(os.path.dirname(__file__), "public"), html=True),
    name="static",
)

@fastapi_app.get("/health")
async def health_check():
    return {"status": "ok"}
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)
register_socket_handlers(sio)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)