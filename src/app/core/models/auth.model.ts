export interface ILoginData {
  email: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
}

export interface IAuthEndpoints {
  auth: string;
  register: string;
  login: string;
}

export interface IJwtPayload {
  exp: number;
}
