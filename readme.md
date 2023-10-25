# packaholic

Node packaging tool, support packing service.

[packaholic-server](https://github.com/hiNISAL/packaholic-server)

## Install

```
npm install packaholic -D
```

## Usage

step 1:

define `packaholic.config.ts` under project root directory。

```ts
// packaholic.config.ts
import { defineConfig } from 'packaholic';

export default defineConfig({
  commands: [
    'npm run install',
    'npm run build',
  ],
  afterCommandsExec: () => {
    // upload dist dir to cdn
    // or other operations
  },
});
```

step 2:

On the packaging service, execute the runner method, which will automatically pull the project and execute the commands defined in packaholic.config.ts.

```ts
import { runner } from 'packaholic';

runner({
  source: 'local_path',
});

try {
  await runner({
    source: 'git remote repository uri',
  });
} catch (err) {
  // fail
}

```

## why named packaholic

blend of "pack" and "-aholic" (from "workaholic").
