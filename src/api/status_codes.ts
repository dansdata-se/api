export enum SuccessfulStatusCode {
  ok = 200,
  created = 201,
  noContent = 204,
}

export enum RedirectionStatusCode {
  /**
   * The URL of the requested resource has been changed permanently. The new URL is given in the response.
   */
  movedPermanently = 301,
  /**
   * This response code means that the URI of requested resource has been changed temporarily.
   * Further changes in the URI might be made in the future.
   * Therefore, this same URI should be used by the client in future requests.
   */
  found = 302,
  /**
   * This is used for caching purposes. It tells the client that the response has not been modified,
   * so the client can continue to use the same cached version of the response.
   */
  notModified = 304,
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
  redirect: RedirectionStatusCode,
  clientError: ClientErrorStatusCode,
  serverError: ServerErrorStatusCode,
};
