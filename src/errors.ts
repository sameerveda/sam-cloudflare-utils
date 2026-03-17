export class HttpError extends Error {
  constructor(
    public readonly status: number,
    msg: string
  ) {
    super(msg);
  }
}

export class InvalidParamError extends HttpError {
  constructor(msg: string) {
    super(400, msg);
  }
}
