import { Response } from "express";

export function sendError(
  res: Response,
  status: number,
  error: string,
  message = error
) {
  return res.status(status).json({ error, message });
}
