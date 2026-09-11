from backend.app.services.ws_service import WebSocketService, ws_manager


def get_ws_manager() -> WebSocketService:
    return ws_manager
