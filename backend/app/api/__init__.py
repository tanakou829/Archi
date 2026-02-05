"""API module initialization."""
from .auth import router as auth_router
from .users import router as users_router
from .settings import router as settings_router
from .dcc import router as dcc_router
from .projects import router as projects_router

__all__ = ["auth_router", "users_router", "settings_router", "dcc_router", "projects_router"]
