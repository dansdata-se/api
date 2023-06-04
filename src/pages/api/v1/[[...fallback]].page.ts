import { ErrorCode, ErrorDTO } from "@/api/dto/error";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  _: NextApiRequest,
  res: NextApiResponse<ErrorDTO>
) {
  res.status(404).json({
    code: ErrorCode.notFound,
    message: "The requested resource does not exist.",
  });
}
