"""
Plugin system for DCC (Digital Content Creation) tool settings.

This module provides a framework for extending the application with
custom DCC tool configuration templates and validators.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class DCCSettingTemplate(BaseModel):
    """Template for a DCC tool setting."""
    key: str = Field(..., description="Setting key")
    label: str = Field(..., description="Human-readable label")
    type: str = Field(..., description="Setting type (string, number, boolean, path, json)")
    default_value: Optional[Any] = Field(None, description="Default value")
    description: Optional[str] = Field(None, description="Setting description")
    required: bool = Field(False, description="Whether this setting is required")
    options: Optional[List[str]] = Field(None, description="Available options for select type")


class DCCPlugin(ABC):
    """Base class for DCC tool plugins."""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Plugin name (e.g., 'maya', 'blender', 'houdini')."""
        pass
    
    @property
    @abstractmethod
    def display_name(self) -> str:
        """Human-readable display name."""
        pass
    
    @property
    @abstractmethod
    def description(self) -> str:
        """Plugin description."""
        pass
    
    @abstractmethod
    def get_settings_template(self) -> List[DCCSettingTemplate]:
        """Return a list of setting templates for this DCC tool."""
        pass
    
    def validate_setting(self, key: str, value: Any) -> bool:
        """
        Validate a setting value.
        
        Args:
            key: Setting key
            value: Setting value
            
        Returns:
            True if valid, False otherwise
        """
        return True
    
    def transform_value(self, key: str, value: Any) -> Any:
        """
        Transform a setting value before saving.
        
        Args:
            key: Setting key
            value: Setting value
            
        Returns:
            Transformed value
        """
        return value


class PluginRegistry:
    """Registry for DCC plugins."""
    
    def __init__(self):
        self._plugins: Dict[str, DCCPlugin] = {}
    
    def register(self, plugin: DCCPlugin):
        """Register a new plugin."""
        self._plugins[plugin.name] = plugin
    
    def get_plugin(self, name: str) -> Optional[DCCPlugin]:
        """Get a plugin by name."""
        return self._plugins.get(name)
    
    def list_plugins(self) -> List[DCCPlugin]:
        """List all registered plugins."""
        return list(self._plugins.values())
    
    def get_all_templates(self) -> Dict[str, List[DCCSettingTemplate]]:
        """Get all setting templates from all plugins."""
        return {
            plugin.name: plugin.get_settings_template()
            for plugin in self._plugins.values()
        }


# Global plugin registry
plugin_registry = PluginRegistry()
