import json

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status

from backend.app.dependencies.auth import _decode_access_token
from backend.app.services.ws_service import ws_manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
):
    try:
        user_id = _decode_access_token(token)
    except ValueError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await ws_manager.connect(user_id, websocket)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            action = data.get("action")
            channel = data.get("channel")

            if action == "subscribe" and channel == "post":
                post_id = data.get("post_id")
                if isinstance(post_id, int):
                    ws_manager.subscribe_post(websocket, post_id)
            elif action == "unsubscribe" and channel == "post":
                post_id = data.get("post_id")
                if isinstance(post_id, int):
                    ws_manager.unsubscribe_post(websocket, post_id)
            elif action == "subscribe" and channel == "feed":
                ws_manager.subscribe_feed(websocket)
            elif action == "unsubscribe" and channel == "feed":
                ws_manager.unsubscribe_feed(websocket)
    except WebSocketDisconnect:
        pass
    finally:
        await ws_manager.disconnect(websocket)
