import { defineConfig } from "../../src/lib/define-config";

export default defineConfig({
  commands: [
    'ls -a',
    'll',
  ],
  afterCommandsExec() {
    console.log(2);
  },
});
