import fs from 'fs';
import path from 'path';
import type { ConfigOption } from '../define-config';
import { MissingConfigError } from '../../helpers/errors';

const CONFIG_NAME = 'packaholic.config.ts';

export const loadConfig = async (root: string, configFilename: string = CONFIG_NAME): Promise<ConfigOption|Function> => {
  const tsConfigPath = path.join(root, `${configFilename}`);

  const tsConfig = fs.existsSync(tsConfigPath);

  if (!tsConfig) {
    throw new MissingConfigError(`Config file not found in root directory, check ${configFilename}`);
  }

  return new Promise((resolve, reject) => {
    import(`${tsConfigPath}?_=${Date.now()}`)
      .then((config) => {
        resolve(config.default);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
