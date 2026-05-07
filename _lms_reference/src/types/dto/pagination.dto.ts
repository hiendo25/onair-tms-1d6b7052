export class PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

type ResponseSuccess<T> = {
  data: T;
  success: true;
};
type ResponseError<T> = {
  data: null;
  success: false;
  errorMessage: string;
  errorCode: string;
};
export type Response<T> = ResponseSuccess<T> | ResponseError<T>;
