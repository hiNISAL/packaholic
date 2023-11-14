import { spawn } from 'node:child_process';
import { getEvnVariable } from '../env';
import path from 'path';
import { execSync } from 'child_process';

export const isURI = (uri: string) => {
  return /^https?:\/\//.test(uri);
};

export const isLocalPath = (path: string) => {
  return path.startsWith("./") || path.startsWith("../") || path.startsWith("/") || path.startsWith("~");
}

const defaultExec = (data: string) => console.log(data.toString());
export const exec = ({
  cmd,
  cwd,
  onStdout = defaultExec,
  ignoreError = false,
  type = 'spawn',
}: {
  cmd: string;
  cwd: string;
  onStdout?: (data: string) => void;
  ignoreError?: boolean;
  type?: 'exec'|'spawn';
}) => {
  if (type === 'exec') {
    return new Promise((resolve, reject) => {
      try {
        const stdout = execSync(cmd, {
          cwd,
          env: process.env,
        });

        resolve(stdout);
      } catch (err) {
        reject(err);
      }
    });
  }

  return new Promise((resolve, reject) => {
    const chunk: string[] = cmd.split(' ');

    const prefix = chunk.shift();

    const task = spawn(prefix!, chunk, {
      cwd,
      env: process.env,
    });

    task.stdout.on('data', onStdout);

    task.stderr.on('data', (data) => {
      if (!ignoreError) {
        reject(data);
      }
    });

    task.on('close', (code) => {
      resolve(code);
    });
  });
};

export const takeProjectCacheRoot = () => {
  const { PROJECTS_CACHE_ROOT = './.projects_cache' } = getEvnVariable();

  return path.resolve(__dirname, '../../../', PROJECTS_CACHE_ROOT);
};
