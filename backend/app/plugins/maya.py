"""Maya DCC plugin."""

from typing import List
from .base import DCCPlugin, DCCSettingTemplate


class MayaPlugin(DCCPlugin):
    """Plugin for Autodesk Maya settings."""
    
    @property
    def name(self) -> str:
        return "maya"
    
    @property
    def display_name(self) -> str:
        return "Autodesk Maya"
    
    @property
    def description(self) -> str:
        return "Configuration settings for Autodesk Maya"
    
    def get_settings_template(self) -> List[DCCSettingTemplate]:
        return [
            DCCSettingTemplate(
                key="workspace_path",
                label="Workspace Path",
                type="path",
                description="Default Maya workspace directory",
                required=False
            ),
            DCCSettingTemplate(
                key="render_engine",
                label="Render Engine",
                type="string",
                default_value="arnold",
                description="Default render engine",
                options=["arnold", "vray", "redshift", "renderman"]
            ),
            DCCSettingTemplate(
                key="ui_scale",
                label="UI Scale",
                type="number",
                default_value=1.0,
                description="UI scaling factor"
            ),
            DCCSettingTemplate(
                key="auto_save_enabled",
                label="Auto Save",
                type="boolean",
                default_value=True,
                description="Enable automatic saving"
            ),
            DCCSettingTemplate(
                key="auto_save_interval",
                label="Auto Save Interval (minutes)",
                type="number",
                default_value=10,
                description="Auto save interval in minutes"
            ),
        ]
