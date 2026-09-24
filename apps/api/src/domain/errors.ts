export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const unauthorized = () =>
  new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.');

export const forbidden = () =>
  new AppError(
    403,
    'FORBIDDEN',
    'You do not have permission to perform this action.',
  );
