export interface IAuthModel {
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