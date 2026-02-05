import * as qs from "qs";

export const parseQueryParams = <T>(searchParams: URLSearchParams): T => {
  return qs.parse(searchParams.toString()) as T;
};
