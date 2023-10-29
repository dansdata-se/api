import { ErrorCode, ErrorDto } from "@/api/dto/error";
import { StatusCodes } from "@/api/status_codes";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  _: NextApiRequest,
  res: NextApiResponse<ErrorDto>
) {
  res.status(StatusCodes.clientError.notFound).json({
    code: ErrorCode.notFound,
    message: "The requested resource does not exist.",
  });
}
