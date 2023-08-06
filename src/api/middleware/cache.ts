import { ApiMiddleware } from "@/api/middleware";

export const cacheMiddleware: ApiMiddleware = (handler) => async (req, res) => {
  if (
    ["GET", "HEAD"].includes(req.method ?? "") &&
    // Do not add cache headers to authorized requests
    !req.headers.authorization
  ) {
    // 900 = 15 minutes
    // https://vercel.com/docs/concepts/functions/serverless-functions/edge-caching#stale-while-revalidate
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate");
  }

  await handler(req, res);
};
