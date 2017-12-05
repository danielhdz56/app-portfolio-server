import { Response } from 'express';

export function handleError (res: Response, message: string) {
  console.log(`Error: ${ message }`);
  res.status(500).json({ 'error': message });
};