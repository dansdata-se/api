import env from "@/env";
import pino, { Level, Logger } from "pino";
import type { PinoPretty, PrettyOptions } from "pino-pretty";

let logger: Logger = pino();

if (process.env.NODE_ENV !== "production") {
  // prettier moves content so that the eslint suppressions are not applied
  // prettier-ignore
  // Use `require` as pino-pretty should only be used in development builds
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pretty = (require("pino-pretty") as (
    options: PrettyOptions
  ) => PinoPretty.PrettyStream);

  const commonConfig: PrettyOptions = {
    colorize: true,
    minimumLevel: env.LOG_LEVEL as Level,
    ignore: "pid,hostname,dansdata",
    translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l o",
    messageFormat:
      "({dansdata.version.ref}:{dansdata.version.sha})[{pid} on {hostname}]: {msg}",
  };

  logger = pino(
    {
      level: env.LOG_LEVEL,
    },
    process.env.NODE_ENV === "development"
      ? pretty({
          ...commonConfig,
        })
      : pretty({
          ...commonConfig,
          // https://github.com/pinojs/pino-pretty#usage-with-jest
          sync: true,
        })
  );
}

export default logger.child({
  dansdata: {
    version: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
      package: require("@/../package.json").version as string,
      ref: env.VERCEL_GIT_COMMIT_REF,
      sha: env.VERCEL_GIT_COMMIT_SHA.substring(0, 7),
    },
  },
});
