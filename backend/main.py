from fastapi import FastAPI
import uvicorn
import socketio
import os
from socket_handlers import register_socket_handlers
from fastapi.staticfiles import StaticFiles
# Create FastAPI app and Socket.IO server
app = FastAPI()
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
asgi_app = socketio.ASGIApp(sio, other_asgi_app=app)
app.mount("/", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "public"), html=True), name="static")
# Register our event handlers (in socket_handlers.py)
register_socket_handlers(sio)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(asgi_app, host="0.0.0.0", port=port)

