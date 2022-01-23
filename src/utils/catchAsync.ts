import Express from "express";

const catchAsync = (fn) => (req: Express.Request, res:Express.Response, next: Express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export default catchAsync;
