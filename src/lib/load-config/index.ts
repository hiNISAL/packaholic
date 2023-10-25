import fs from 'fs';
import path from 'path';
import type { ConfigOption } from '../define-config';
import { MissingConfigError } from '../../helpers/errors';

const CONFIG_NAME = 'packaholic.config';

export const loadConfig = async (root: string): Promise<ConfigOption> => {
  const tsConfigPath = path.join(root, `${CONFIG_NAME}.ts`);

  const tsConfig = fs.existsSync(tsConfigPath);

  if (!tsConfig) {
    throw new MissingConfigError('Config file not found in root directory, check packaholic.config.ts');
  }

  return new Promise((resolve, reject) => {
    import(tsConfigPath)
      .then((config) => {
        resolve(config.default);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
