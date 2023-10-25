import { defineConfig } from "../../src/lib/define-config";

export default defineConfig({
  commands: [
    'ls -a',
    'npm -v',
  ],
  afterCommandsExec() {
    console.log(2);
  },
});
