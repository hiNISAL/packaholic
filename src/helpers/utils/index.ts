import { spawn } from 'node:child_process';
import { getEvnVariable } from '../env';
import fs from 'fs';
import path from 'path';

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
}: {
  cmd: string;
  cwd: string;
  onStdout?: (data: string) => void;
}) => {
  return new Promise((resolve, reject) => {
    const chunk: string[] = cmd.split(' ');

    const prefix = chunk.shift();

    const task = spawn(prefix!, chunk, {
      cwd,
    });

    task.stdout.on('data', onStdout);

    task.stderr.on('data', (data) => {
      reject(data);
    });

    task.on('close', (code) => {
      resolve(code);
    });
  });
};

export const takeProjectCacheRoot = () => {
  const { PROJECTS_CACHE_ROOT } = getEvnVariable();

  return path.resolve(__dirname, '../../../', PROJECTS_CACHE_ROOT);
};
