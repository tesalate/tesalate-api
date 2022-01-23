import { Query } from 'express-static-serve-core';


export interface TypedRequestParams<T> extends Express.Request {
  params: T
}

export interface TypedRequest<T extends Query, U> extends Express.Request {
  body: U,
  query: T
}