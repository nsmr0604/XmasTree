import appSettings from './app-settings.json' with { type: 'json' };
import sceneSettings from './scene-settings.json' with { type: 'json' };

export default { ...sceneSettings, ...appSettings };
