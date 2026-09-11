export interface ILoginData {
  email: string;
  password: string;
}

export interface IAuthResponse {
  challengeId: string | null;
  requiresTwoFactor: boolean;
  token: string | null;
}

export interface IAuthEndpoints {
  auth: string;
  register: string;
  login: string;
  twoFactorAuth: string;
  resendTwoFactorAuth: string;
}

export interface IJwtPayload {
  exp: number;
}

export interface ITwoFactorData {
  challengeId: string | null;
  code: string;
}

export interface ITwoFactorResponse {
  token: string;
  requiresTwoFactor: boolean;
  challengeId: null;
}

export interface IResendTwoFactorData {
  challengeId: string | null;
}
