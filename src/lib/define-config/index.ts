export interface ConfigOption {
  /** build command list */
  commands?: string[];
  /** Call after command execution */
  afterCommandsExec?: () => void;
}

export const defineConfig = (config: ConfigOption) => {
  return config;
};
