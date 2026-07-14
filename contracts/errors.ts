export const Errors = {
  unauthorized: (msg: string = "Unauthorized") => new Error(msg),
  forbidden: (msg: string = "Forbidden") => new Error(msg),
  notFound: (msg: string = "Not found") => new Error(msg),
  badRequest: (msg: string = "Bad request") => new Error(msg),
  conflict: (msg: string = "Conflict") => new Error(msg),
  internal: (msg: string = "Internal error") => new Error(msg),
};
