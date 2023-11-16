type Context = Record<string, any>;
type Callback = (options: Context) => void|Promise<void>;

export type RunCmdCallback = (options: {
  context: Context;
  cmdConfig: CmdConfig;
  cmd: string;
  envVariables: Record<string, string>;
}) => Promise<void>|void;

export interface CmdConfig {
  cmd: string;
  cwd?: string;
  beforeExec?: RunCmdCallback;
  afterExec?: RunCmdCallback;
  ignoreError?: boolean;
  execType?: 'spawn'|'exec',
};

export interface ConfigOption {
  /** build command list */
  commands?: (string|CmdConfig)[];
  /** Call after command execution */
  afterCommandsExec?: Callback;
  /** to replace cmd placeholder before cmd exec */
  mappingEnvVariables?: Record<string, string> | ((ctx?: Context) => Record<string, string>);
  /** command called by spawn that strict, set true to ignore errors */
  ignoreSpawnError?: boolean;
  /** others */
  [propName: string]: any;
}

export const defineConfig = (config: ConfigOption) => {
  return config;
};
