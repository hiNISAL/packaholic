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
}

const defaultCmdConfig: CmdConfig = {
  cmd: '',
  cwd: '',
  beforeExec: () => {},
  afterExec: () => {},
  ignoreError: false,
};

// -------------------------------------------------------------------------

const getGitRepository = async (source: string) => {
  const root = takeProjectCacheRoot();

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
      cwd: takeProjectCacheRoot(),
      ignoreError: true,
    })
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
    projectRoot = await getGitRepository(source);
  }

  const config = await loadConfig(projectRoot);

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

      cmdConfig.beforeExec!(callbackOptions);

      await exec({
        cmd: execCmd,
        cwd: cmdConfig.cwd,
        ignoreError,
      });

      cmdConfig.afterExec!(callbackOptions);
    } catch (err: any) {
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
