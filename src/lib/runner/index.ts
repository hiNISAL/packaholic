import path from 'path';
import fs from 'fs';
import { CloneRepositoryFail, RunCommandError } from "../../helpers/errors";
import { exec, isLocalPath, takeProjectCacheRoot } from "../../helpers/utils";
import { loadConfig } from "../load-config";
import type { CmdConfig } from "../define-config";

// -------------------------------------------------------------------------

interface RunnerOptions {
  // git repository or local path
  source: string;
  // context to hooks
  context?: Record<string, any>
  // after repository cloned
  afterRepositoryCloned?: (opt: {
    projectRoot: string;
  }) => Promise<void>;
  // root path of repository
  repositoryRoot?: string,
  onCommandExecError?: (err: Error) => false|any;
}

const defaultCmdConfig: CmdConfig = {
  cmd: '',
  cwd: '',
  beforeExec: () => {},
  afterExec: () => {},
  ignoreError: false,
  execType: 'spawn',
};

// -------------------------------------------------------------------------

const getGitRepository = async ({
  source,
  cacheRoot,
}: {
  source: string;
  cacheRoot: string;
}) => {
  const root = cacheRoot ?? takeProjectCacheRoot();

  let projectFolderName = source.split('/').pop()!;

  if (source.endsWith('.git')) {
    projectFolderName = projectFolderName.replace('.git', '');
  }

  const projectFolderPath = path.resolve(root, projectFolderName);

  const hasProjectFolder = fs.existsSync(projectFolderPath);

  if (hasProjectFolder) {
    return projectFolderPath;
  }

  try {
    await exec({
      cmd: `git clone ${source}`,
      cwd: root,
      ignoreError: true,
    });
  } catch (err: any) {
    console.error(err.toString());
  }

  const hasProjectFolderAfterPull = fs.existsSync(projectFolderPath);

  if (!hasProjectFolderAfterPull) {
    throw new CloneRepositoryFail(`clone repository fail: ${source}`);
  }

  return projectFolderPath;
};

// -------------------------------------------------------------------------

/**
 * get source and run by packaholic config
 * @param options RunnerOptions
 */
export const runner = async (options: RunnerOptions) => {
  const { source } = options;

  let projectRoot = source;

  // -------------------------------------------------------------------------
  if (isLocalPath(source)) {
    projectRoot = path.resolve(process.cwd(), source);
  } else {
    // uri to download
    projectRoot = await getGitRepository({
      source,
      cacheRoot: options.repositoryRoot || '',
    });

    if (options.afterRepositoryCloned) {
      await options.afterRepositoryCloned({
        projectRoot,
      });
    }
  }

  const config = await (async () => {
    const cfg = await loadConfig(projectRoot);

    if (typeof cfg === 'function') {
      return cfg(options.context || {});
    }

    return cfg;
  })();

  const {
    commands = [],
    afterCommandsExec,
    ignoreSpawnError = false,
    mappingEnvVariables = {},
  } = config;

  let envVariables = mappingEnvVariables as Record<string, string>;

  if (typeof mappingEnvVariables === 'function') {
    envVariables = mappingEnvVariables(options.context);
  }

  for (let cmd of commands) {
    let cmdConfig: CmdConfig = cmd as CmdConfig;

    if (typeof cmd === 'string') {
      cmdConfig = {
        ...defaultCmdConfig,
        cmd,
      }
    }

    let ignoreError = ignoreSpawnError || cmdConfig.ignoreError;

    cmdConfig.cwd = cmdConfig.cwd
      ? path.resolve(projectRoot, cmdConfig.cwd)
      : projectRoot;

    try {
      let execCmd = cmdConfig.cmd;
      if (execCmd.startsWith('@@')) {
        execCmd = execCmd.replace('@@', '');
        ignoreError = true;
      }

      for (let variable of Object.keys(envVariables)) {
        execCmd = execCmd.replace(`{{${variable}}}`, envVariables[variable]);
      }

      const callbackOptions = {
        context: options.context!,
        cmdConfig,
        cmd: execCmd,
        envVariables,
      };

      if (cmdConfig.beforeExec) {
        await cmdConfig.beforeExec(callbackOptions);
      }

      await exec({
        cmd: execCmd,
        cwd: cmdConfig.cwd,
        ignoreError,
        type: cmdConfig.execType,
      });

      if (cmdConfig.afterExec) {
        await cmdConfig.afterExec(callbackOptions);
      }
    } catch (err: any) {
      if (options.onCommandExecError) {
        const result = await options.onCommandExecError(err);

        if (result === false) {
          console.error(err.toString());
          throw new RunCommandError(err.toString());
        }
      }

      if (ignoreError) {
        continue;
      }

      console.error(err.toString());
      throw new RunCommandError(err.toString());
    }
  }

  if (afterCommandsExec) {
    return afterCommandsExec(options.context || {});
  }
};
