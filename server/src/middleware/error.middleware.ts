import { NextFunction, Request, Response } from 'express'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  void _next

  if (err instanceof Error) {
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    })
    return
  }

  res.status(500).json({ message: 'Internal server error' })
}
