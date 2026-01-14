export class DomainError extends Error {
  status: number;
  data?: any;
  code: string;
  name: string;

  constructor(message: string, code: string, status: number, data?: any) {
    super(message);
    this.name = "DomainError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}
