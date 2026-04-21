export interface AuthModel {
  email: string,
  password: string;
}

export interface AuthResponse {
  token: string;
}