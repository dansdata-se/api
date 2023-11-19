import { ErrorCode, ErrorDto, errorCodeToStatusCode } from "@/api/dto/error";
import z from "@/api/zod";
import { NextApiResponse } from "next";
import { fromZodError } from "zod-validation-error";

/**
 * Calls the given callback with the parsed `obj` or responds with status 400 if
 * the given object is not valid under the given schema.
 *
 * @param errorCode The error code to use in the returned {@link ErrorDto} if
 * parsing fails.
 */
export async function withParsedObject<T extends z.ZodSchema, R>(
  schema: T,
  obj: unknown,
  res: NextApiResponse,
  errorCode: ErrorCode,
  callback: (obj: z.infer<T>) => R | Promise<R>
): Promise<R | null> {
  const parseResult = schema.safeParse(obj);
  if (parseResult.success) {
    return await callback(parseResult.data as z.infer<T>);
  } else {
    const validationError = fromZodError(parseResult.error);
    res.setHeader("content-type", "application/json");
    (res as NextApiResponse<ErrorDto>)
      .status(errorCodeToStatusCode(errorCode))
      .json({
        code: errorCode,
        message: validationError.message,
      });
    return null;
  }
}

export function commaSeparatedToArray(commaSeparated: string): string[] {
  return commaSeparated
    .split(",")
    .map((it) => it.trim())
    .filter((it) => !!it.length);
}
