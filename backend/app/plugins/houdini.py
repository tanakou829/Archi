"""Houdini DCC plugin."""

from typing import List
from .base import DCCPlugin, DCCSettingTemplate


class HoudiniPlugin(DCCPlugin):
    """Plugin for SideFX Houdini settings."""
    
    @property
    def name(self) -> str:
        return "houdini"
    
    @property
    def display_name(self) -> str:
        return "SideFX Houdini"
    
    @property
    def description(self) -> str:
        return "Configuration settings for SideFX Houdini"
    
    def get_settings_template(self) -> List[DCCSettingTemplate]:
        return [
            DCCSettingTemplate(
                key="project_path",
                label="Project Path",
                type="path",
                description="Default Houdini project directory",
                required=False
            ),
            DCCSettingTemplate(
                key="hip_directory",
                label="HIP Directory",
                type="path",
                description="Houdini scene file directory",
                required=False
            ),
            DCCSettingTemplate(
                key="render_engine",
                label="Render Engine",
                type="string",
                default_value="mantra",
                description="Default render engine",
                options=["mantra", "karma", "redshift", "arnold"]
            ),
            DCCSettingTemplate(
                key="cache_directory",
                label="Cache Directory",
                type="path",
                description="Default cache directory for simulations",
                required=False
            ),
            DCCSettingTemplate(
                key="thread_count",
                label="Thread Count",
                type="number",
                default_value=0,
                description="Number of threads (0 = auto)"
            ),
        ]
