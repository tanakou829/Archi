"""Plugins module initialization."""

from .base import DCCPlugin, DCCSettingTemplate, plugin_registry
from .maya import MayaPlugin
from .blender import BlenderPlugin
from .houdini import HoudiniPlugin

# Register all plugins
plugin_registry.register(MayaPlugin())
plugin_registry.register(BlenderPlugin())
plugin_registry.register(HoudiniPlugin())

__all__ = [
    "DCCPlugin",
    "DCCSettingTemplate",
    "plugin_registry",
    "MayaPlugin",
    "BlenderPlugin",
    "HoudiniPlugin",
]
