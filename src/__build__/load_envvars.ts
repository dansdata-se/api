import spawn from "cross-spawn";
import { config } from "dotenv";
import { existsSync } from "fs";
import minimist from "minimist";
import path from "path";

function debug(message: string) {
  if (process.env.DEBUG) {
    console.debug(message);
  }
}

const argv = minimist(process.argv.slice(2));
const command = argv._[0];
if (!command) {
  console.log("Usage: ts-node load_envvars.ts [-- command]");
  console.log(
    "  command    `command` is the actual command you want to run. Best practice is to precede this command with ` -- `. Everything after `--` is considered to be your command. So any flags will not be parsed by this tool but be passed to your command. If you do not do it, this tool will strip those flags"
  );
  process.exit(1);
}

const envfile = path.resolve(
  __dirname,
  "../../",
  `.env.${process.env.NODE_ENV ?? "development"}.local`
);

debug("Looking for local variable overrides at " + envfile);
if (existsSync(envfile)) {
  debug("Reading local variable overrides");
  config({
    path: envfile,
  });
} else {
  debug("No local variable overrides found");
}

import env from "@/env";
Object.assign(process.env, env);

spawn(command, argv._.slice(1), { stdio: "inherit" }).on(
  "exit",
  function (exitCode, signal) {
    if (typeof exitCode === "number") {
      process.exit(exitCode);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.kill(process.pid, signal!);
    }
  }
);
