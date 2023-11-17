# packaholic

> [packaholic-server](https://github.com/hiNISAL/packaholic-server), a simple implementation of packaging service based on packaholic.

Node packaging tool, support packing service.

## Install

```shell
# on client
npm i packaholic -D

# on server
bun add packaholic
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

// also can export an function
export default (context) => {
  const { env } = context;

  return defineConfig({
    commands: [
      `npm run install -- --env=${env}`,
      'npm run build',
    ],
    afterCommandsExec: () => {
      // upload dist dir to cdn
      // or other operations
    },
  });
};
```

step 2:

On the packaging service, execute the runner method, which will automatically pull the project and execute the commands defined in packaholic.config.ts.

```ts
import { runner } from 'packaholic';

runner({
  source: 'local_path',
  context: {
    env: 'develop',
  },
});

try {
  await runner({
    source: 'git remote repository uri',
    repositoryRoot: './.cache_root',
    afterRepositoryCloned: () => {
    },
    onCommandExecError(err) {
      // return false to break
      return false;
    },
    afterConfigLoaded(config) {
      // config loaded
    },
    // define config filename, default is `packaholic.config.ts`
    // configFilename: 'packaholic.config.ts',
  });
} catch (err) {
  // fail
}
```

or run with customize bash:

```ts
import { runner } from 'packaholic';
import { spawn } from 'child_process';

runner({
  source: 'local_path',
  context: {
    env: 'develop',
  },
});

// or by Bun.spawn
const bash = spawn('bash', {
  shell: '/bin/bash',
  env: process.env,
});

try {
  await runner({
    source: 'git remote repository uri',
    repositoryRoot: './.cache_root',
    // If you need to customize some environments, such as using nvm to switch node, you can use this method.
    // packaholic will run the command in the bash object passed in.
    bash,
  });
} catch (err) {
  // fail
}
```

## config

```ts
// packaholic.config.ts
import { defineConfig } from 'packaholic';

export default defineConfig({
  commands: [
    'npm run install',
    // start with @@ will ignore error
    '@@npm run install',
    // more configure
    {
      // replace env by `mappingEnvVariables`
      cmd: 'npm run build -- --ENV={{env}}',
      cwd: './',
      ignoreError: false,
      beforeExec: (opts) => {},
      afterExec: (opts) => {},
    },
  ],
  afterCommandsExec: (context) => {
    // upload dist dir to cdn
    // or other operations
  },
  mappingEnvVariables(context) {
    return {
      env: context.env,
    };
  },
  ignoreSpawnError： false,
});
```

## why named packaholic

blend of "pack" and "-aholic" (from "workaholic").
