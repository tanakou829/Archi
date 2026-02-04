"""Blender DCC plugin."""

from typing import List
from .base import DCCPlugin, DCCSettingTemplate


class BlenderPlugin(DCCPlugin):
    """Plugin for Blender settings."""
    
    @property
    def name(self) -> str:
        return "blender"
    
    @property
    def display_name(self) -> str:
        return "Blender"
    
    @property
    def description(self) -> str:
        return "Configuration settings for Blender"
    
    def get_settings_template(self) -> List[DCCSettingTemplate]:
        return [
            DCCSettingTemplate(
                key="project_path",
                label="Project Path",
                type="path",
                description="Default Blender project directory",
                required=False
            ),
            DCCSettingTemplate(
                key="render_engine",
                label="Render Engine",
                type="string",
                default_value="cycles",
                description="Default render engine",
                options=["cycles", "eevee", "workbench"]
            ),
            DCCSettingTemplate(
                key="samples",
                label="Render Samples",
                type="number",
                default_value=128,
                description="Default render samples"
            ),
            DCCSettingTemplate(
                key="auto_save_enabled",
                label="Auto Save",
                type="boolean",
                default_value=True,
                description="Enable automatic saving"
            ),
            DCCSettingTemplate(
                key="save_versions",
                label="Save Versions",
                type="number",
                default_value=3,
                description="Number of backup versions to keep"
            ),
        ]
