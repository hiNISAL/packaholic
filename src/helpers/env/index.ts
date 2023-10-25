interface Env {
  PROJECTS_CACHE_ROOT: string;
}

export const getEvnVariable = (): Env => {
  return process.env as any;
};
