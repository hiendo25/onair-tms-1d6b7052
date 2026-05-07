export class HttpError extends Error {
  status: number;
  code: string;
  data?: any;

  constructor(status: number, code: string, message: string, data?: any) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
    this.code = code;

    Object.setPrototypeOf(this, new.target.prototype);

    // Proper stack trace (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
}
