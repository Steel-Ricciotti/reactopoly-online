from fastapi import FastAPI
import uvicorn
import socketio

from socket_handlers import register_socket_handlers

# Create FastAPI app and Socket.IO server
app = FastAPI()
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
asgi_app = socketio.ASGIApp(sio, other_asgi_app=app)

# Register our event handlers (in socket_handlers.py)
register_socket_handlers(sio)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    # Run via: python main.py
    uvicorn.run(asgi_app, host="0.0.0.0", port=8000)
