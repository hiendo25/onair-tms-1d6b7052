export class DomainError<M = unknown> extends Error {
  status: number;
  data?: any;
  code: string;
  meta?: M;

  constructor(message: string, code: string, status: number, meta?: M) {
    super(message);
    this.name = "DomainError";
    this.status = status;
    this.code = code;
    this.meta = meta;

    // Fix prototype chain (important for instanceof)
    Object.setPrototypeOf(this, new.target.prototype);

    // Proper stack trace (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainError);
    }
  }
}
