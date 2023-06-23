import { ErrorCode, ErrorDTO } from "@/api/dto/error";
import z from "@/api/zod";
import { NextApiResponse } from "next";
import { fromZodError } from "zod-validation-error";

/**
 * Calls the given callback with the parsed `obj` or responds with status 400 if
 * the given object is not valid under the given schema.
 *
 * @param errorCode The error code to use in the returned {@link ErrorDTO} if
 * parsing fails.
 */
export async function withParsedObject<T extends z.ZodSchema>(
  schema: T,
  obj: unknown,
  res: NextApiResponse,
  errorCode: ErrorCode,
  callback: (obj: z.infer<T>) => Promise<void>
): Promise<void> {
  const parseResult = schema.safeParse(obj);
  if (parseResult.success) {
    return callback(parseResult.data as z.infer<T>);
  } else {
    const validationError = fromZodError(parseResult.error);
    res.setHeader("content-type", "application/json");
    (res as NextApiResponse<ErrorDTO>).status(400).json({
      code: errorCode,
      message: validationError.message,
    });
  }
}

export function commaSeparatedToArray(commaSeparated: string): string[] {
  return commaSeparated
    .split(",")
    .map((it) => it.trim())
    .filter((it) => !!it.length);
}
