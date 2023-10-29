export enum SuccessfulStatusCode {
  ok = 200,
  created = 201,
  noContent = 204,
}

export enum ClientErrorStatusCode {
  badRequest = 400,
  unauthorized = 401,
  forbidden = 403,
  notFound = 404,
  methodNotAllowed = 405,
}

export enum ServerErrorStatusCode {
  internalServerError = 500,
  notImplemented = 501,
}

export const StatusCodes = {
  success: SuccessfulStatusCode,
  clientError: ClientErrorStatusCode,
  serverError: ServerErrorStatusCode,
};
