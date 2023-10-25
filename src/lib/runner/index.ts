import { DownloadError, RunCommandError } from "../../helpers/errors";
import { exec, isLocalPath, takeProjectCacheRoot } from "../../helpers/utils";
import { loadConfig } from "../load-config";
import path from 'path';

// -------------------------------------------------------------------------

interface RunnerOptions {
  // git repository or local path
  source: string;
  // context to hooks
  context?: Record<string, any>
}

// -------------------------------------------------------------------------

const getGitRepository = async (source: string) => {
  const root = takeProjectCacheRoot();

  try {
    await exec({
      cmd: `git clone ${source}`,
      cwd: takeProjectCacheRoot(),
    })
  } catch (err) {
    throw new DownloadError(err);
  }

  let projectFolderName = source.split('/').pop()!;

  if (source.endsWith('.git')) {
    projectFolderName = projectFolderName.replace('.git', '');
  }

  return projectFolderName;
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
  } = config;

  try {
    for (let cmd of commands) {
      await exec({
        cmd,
        cwd: projectRoot,
      });
    }
  } catch (err) {
    throw new RunCommandError(err);
  }

  if (afterCommandsExec) {
    return afterCommandsExec(options.context || {});
  }
};
