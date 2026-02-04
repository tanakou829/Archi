from fastapi import APIRouter, Depends
from typing import List, Dict

from app.plugins import plugin_registry, DCCSettingTemplate
from app.models import User
from .auth import get_current_user

router = APIRouter(prefix="/dcc", tags=["DCC Tools"])


@router.get("/plugins")
def list_plugins(current_user: User = Depends(get_current_user)):
    """List all available DCC tool plugins."""
    plugins = plugin_registry.list_plugins()
    return [
        {
            "name": plugin.name,
            "display_name": plugin.display_name,
            "description": plugin.description
        }
        for plugin in plugins
    ]


@router.get("/templates")
def get_all_templates(current_user: User = Depends(get_current_user)):
    """Get all setting templates from all DCC plugins."""
    return plugin_registry.get_all_templates()


@router.get("/templates/{plugin_name}")
def get_plugin_template(plugin_name: str, current_user: User = Depends(get_current_user)):
    """Get setting template for a specific DCC plugin."""
    plugin = plugin_registry.get_plugin(plugin_name)
    if not plugin:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plugin '{plugin_name}' not found"
        )
    
    return {
        "name": plugin.name,
        "display_name": plugin.display_name,
        "description": plugin.description,
        "settings": plugin.get_settings_template()
    }
