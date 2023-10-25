import { loadConfig } from "../../src/lib/load-config";
import path from 'path';
import fs from 'fs';

(async () => {
  const config = await loadConfig(path.resolve(__dirname, './'));

  console.log(config);
})();
