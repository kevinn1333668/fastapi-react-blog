from fastapi import WebSocket
from typing import Dict, Set


class WebSocketService:
    _active_connections: Dict[int, Set[WebSocket]] = {}
    _post_subscriptions: Dict[int, Set[WebSocket]] = {}   # post_id -> sockets
    _feed_subscribers: Set[WebSocket] = set()

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self._active_connections.setdefault(user_id, set()).add(websocket)

    async def disconnect(self, user_id: int, websocket: WebSocket):
        connections = self._active_connections.get(user_id)
        if connections is not None:
            connections.discard(websocket)
            if not connections:
                del self._active_connections[user_id]

        for post_id, sockets in list(self._post_subscriptions.items()):
            sockets.discard(websocket)
            if not sockets:
                del self._post_subscriptions[post_id]

        self._feed_subscribers.discard(websocket)

    def subscribe_post(self, websocket: WebSocket, post_id: int):
        self._post_subscriptions.setdefault(post_id, set()).add(websocket)

    def unsubscribe_post(self, websocket: WebSocket, post_id: int):
        sockets = self._post_subscriptions.get(post_id)
        if sockets is not None:
            sockets.discard(websocket)
            if not sockets:
                del self._post_subscriptions[post_id]

    def subscribe_feed(self, websocket: WebSocket):
        self._feed_subscribers.add(websocket)

    def unsubscribe_feed(self, websocket: WebSocket):
        self._feed_subscribers.discard(websocket)


ws_manager = WebSocketService()