export interface HttpError extends Error {
  status?: number;
  code?: string | number;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role?: string;
}
