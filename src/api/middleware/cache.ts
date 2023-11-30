import { ApiMiddleware } from "@/api/middleware";
import { StatusCodes } from "@/api/status_codes";
import { NextApiRequest } from "next";

function getUrlFromRequest(req: NextApiRequest): URL {
  return new URL(
    req.url ?? "",
    // These headers are guaranteed by vercel
    // x-forwarded-proto: https://vercel.com/docs/edge-network/headers#x-forwarded-proto
    // host: https://vercel.com/docs/edge-network/headers#host
    `${req.headers["x-forwarded-proto"] as string}://${req.headers.host}`
  );
}

function getCacheOptimizedUrlFromRequest(req: NextApiRequest): URL {
  const originalUrl = getUrlFromRequest(req);
  const optimizedUrl = new URL(originalUrl);

  // Increase likelyhood of a cache hit by using a fixed precision for geo lookups
  for (const geoKey of ["lat", "latitude", "lng", "lon", "longitude"]) {
    const value = parseFloat(optimizedUrl.searchParams.get(geoKey) ?? "NaN");
    if (!isNaN(value)) {
      optimizedUrl.searchParams.delete(geoKey);
      optimizedUrl.searchParams.set(
        geoKey,
        // 3 decimals = ~110 m precision
        value.toFixed(3)
      );
    }
  }

  // Increase likelyhood of a cache hit by sorting any query parameters
  const sortedQueryParams = Array.from(
    optimizedUrl.searchParams.entries()
  ).sort(([a], [b]) => {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
  Array.from(optimizedUrl.searchParams.keys()).forEach((key) =>
    optimizedUrl.searchParams.delete(key)
  );
  sortedQueryParams.forEach(([key, value]) =>
    optimizedUrl.searchParams.append(
      key,
      // Increase likelyhood of a cache hit by normalizing the casing of incoming values
      value.toLowerCase()
    )
  );

  return optimizedUrl;
}

export const cacheMiddleware: ApiMiddleware = (handler) => async (req, res) => {
  if (
    ["GET", "HEAD"].includes(req.method ?? "") &&
    // Do not add cache headers to authorized requests
    !req.headers.authorization
  ) {
    const originalUrl = getUrlFromRequest(req);
    const optimizedUrl = getCacheOptimizedUrlFromRequest(req);
    if (originalUrl.toString() !== optimizedUrl.toString()) {
      res
        .writeHead(StatusCodes.redirect.movedPermanently, {
          location: optimizedUrl.toString(),
        })
        .end();
      return;
    }

    // 900 = 15 minutes
    // https://vercel.com/docs/concepts/functions/serverless-functions/edge-caching#stale-while-revalidate
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate");
  }

  await handler(req, res);
};
