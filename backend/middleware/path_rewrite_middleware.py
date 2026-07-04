# backend/middleware/path_rewrite_middleware.py
from starlette.types import ASGIApp, Receive, Scope, Send

class PathRewriteMiddleware:
    """
    ASGI Middleware to rewrite incoming legacy/non-API paths dynamically.
    For example:
      - /student/123/profile -> /api/student/123/profile
      - /faculty/123/classes -> /api/faculty/123/classes
      - /class/123/students -> /api/class/123/students
    
    This allows removing duplicate route decorators and clean API documentation.
    """
    def __init__(self, app: ASGIApp):
        self.app = app
        self.rewrite_map = {
            "/faculty/student/": "/api/v1/faculty/student/",
            "/faculty/announcements": "/api/announcements",
            "/api/domains": "/api/v1/domains",
            "/api/quiz/submit": "/api/v1/quiz/submit",
        }

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            path = scope.get("path", "")
            if path:
                # Check for explicit mapping first (handles v1 migration redirects)
                rewritten = False
                for prefix, replacement in self.rewrite_map.items():
                    if path.startswith(prefix):
                        scope["path"] = path.replace(prefix, replacement, 1)
                        rewritten = True
                        break
                
                # Default fallback is prepending /api for non-API legacy paths
                if not rewritten and not (
                    path == "/" 
                    or path.startswith("/api/") 
                    or path.startswith("/docs") 
                    or path.startswith("/redoc") 
                    or path.startswith("/openapi.json")
                ):
                    scope["path"] = f"/api{path}"
                
        await self.app(scope, receive, send)
