// Shapes of the account API responses.

export type User = {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  account_type: "individual" | "business";
  tax_code: string | null;
  company_name: string | null;
  legal_rep_name: string | null;
  legal_rep_id: string | null;
  legal_rep_position: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | "unspecified" | null;
  address: string | null;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
};

export type AuthResponse = {
  user: User;
  tokens: TokenPair;
};

export type SessionInfo = {
  session_id: string;
  user_agent: string | null;
  ip: string | null;
  created_at: string;
  last_seen_at: string | null;
  is_current: boolean;
};

export type FieldErrors = Record<string, string>;

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: FieldErrors;
};
