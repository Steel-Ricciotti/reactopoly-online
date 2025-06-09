# from fastapi import FastAPI
# import uvicorn
# import socketio

# from socket_handlers import register_socket_handlers

# # Create FastAPI app and Socket.IO server
# app = FastAPI()
# sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
# asgi_app = socketio.ASGIApp(sio, other_asgi_app=app)

# # Register our event handlers (in socket_handlers.py)
# register_socket_handlers(sio)

# @app.get("/health")
# async def health_check():
#     return {"status": "ok"}

# if __name__ == "__main__":
#     # Run via: python main.py
#     uvicorn.run(asgi_app, host="0.0.0.0", port=8000)
import os
import uvicorn
import socketio
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from socket_handlers import register_socket_handlers

# 1) Your real FastAPI app
fastapi_app = FastAPI()

# 1a) Serve your React build at the root
fastapi_app.mount(
    "/",
    StaticFiles(directory=os.path.join(os.path.dirname(__file__), "public"), html=True),
    name="static",
)

# 1b) Any other HTTP endpoints
@fastapi_app.get("/health")
async def health_check():
    return {"status": "ok"}

# 2) Create and configure the Socket.IO server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# 3) Wrap FastAPI in the Socket.IO ASGI app, and call _this_ "app"
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)

# 4) Register your Socket.IO event handlers
register_socket_handlers(sio)

# 5) When run directly, start uvicorn on **app**
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)