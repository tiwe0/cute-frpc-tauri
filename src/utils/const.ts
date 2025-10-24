import { exists, mkdir } from "@tauri-apps/plugin-fs";
import { resolveResource, appConfigDir } from "@tauri-apps/api/path";

export const APP_CONFIG_DIR = await appConfigDir();
export const APP_DEFAULT_FRPC_CONFIG_PATH = await resolveResource("resources/default_config.toml");
export const APP_FRPC_CONFIG_PATH = `${await appConfigDir()}/frpc_config.toml`;
export const APP_SAKURA_API_KEY_PATH = `${await appConfigDir()}/sakura_api_key.txt`;

if (await exists(APP_CONFIG_DIR) === false) {
  await mkdir(APP_CONFIG_DIR);
}

export default {
  APP_DEFAULT_FRPC_CONFIG_PATH,
  APP_FRPC_CONFIG_PATH,
  APP_SAKURA_API_KEY_PATH,
};
