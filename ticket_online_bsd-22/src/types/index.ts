export type CustomResponse<T> = {
  statusCode: number;
  message?: string;
  data?: T;
  error?: string;
};

export type JosePayload = {
  id: string;
  email: string;
  name: string;
};

export type ActionResponse<T> = {
  success: boolean;
  message?: string;
  error?: {
    [k in keyof T]?: string[];
  };
  input?: T;
};
