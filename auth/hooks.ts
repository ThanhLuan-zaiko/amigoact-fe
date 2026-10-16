import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import { useUploadAvatar } from "../profiles/hooks.ts";
import {
  changePasswordAccount,
  clearSessionToken,
  fetchSession,
  forgotPasswordAccount,
  listAuthSessions,
  loginAccount,
  logoutAccount,
  logoutAllSessions,
  registerAccount,
  resendVerificationCode,
  resetPasswordAccount,
  revokeAuthSession,
  updateProfile,
  verifyEmailAccount,
  type AuthSession,
  type RegisterInput,
  type SessionProfile,
  type UpdateProfileInput,
} from "./api.ts";
import { authKeys, sessionKeys } from "./keys.ts";
import type { RegisterForm } from "./schemas.ts";

export function useSession(): UseQueryResult<SessionProfile | null> {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: fetchSession,
    retry: false,
    staleTime: 60_000,
  });
}

function useInvalidateSession<TData>() {
  const queryClient = useQueryClient();
  return {
    onSuccess: async (data: TData) => {
      await queryClient.invalidateQueries({ queryKey: authKeys.session() });
      return data;
    },
  };
}

export function useRegister(): UseMutationResult<
  SessionProfile,
  ApiError,
  RegisterInput
> {
  return useMutation({
    mutationFn: registerAccount,
    ...useInvalidateSession<SessionProfile>(),
  });
}

export function useVerifyEmail(): UseMutationResult<
  SessionProfile,
  ApiError,
  { email: string; code: string }
> {
  return useMutation({
    mutationFn: verifyEmailAccount,
    ...useInvalidateSession<SessionProfile>(),
  });
}

export function useResendVerification(): UseMutationResult<
  void,
  ApiError,
  string
> {
  return useMutation({     meta: { successToast: "auth.resend" },
mutationFn: resendVerificationCode });
}

export function useLogin(): UseMutationResult<
  { access_token: string; token_type: string; expires_in: number },
  ApiError,
  { email: string; password: string }
> {
  return useMutation({
    mutationFn: loginAccount,
    ...useInvalidateSession<{
      access_token: string;
      token_type: string;
      expires_in: number;
    }>(),
  });
}

export function useUpdateProfile(): UseMutationResult<
  SessionProfile,
  ApiError,
  UpdateProfileInput
> {
  return useMutation({
        meta: { successToast: "auth.profile" },
mutationFn: updateProfile,
    ...useInvalidateSession<SessionProfile>(),
  });
}

export function useLogout(): UseMutationResult<void, ApiError, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutAccount,
    onSettled: async () => {
      clearSessionToken();
      queryClient.setQueryData(authKeys.session(), null);
      await queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}

export function useLogoutAll(): UseMutationResult<void, ApiError, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutAllSessions,
    onSettled: async () => {
      clearSessionToken();
      queryClient.setQueryData(authKeys.session(), null);
      await queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}

export function useForgotPassword(): UseMutationResult<void, ApiError, string> {
  return useMutation({ mutationFn: forgotPasswordAccount });
}

export function useResetPassword(): UseMutationResult<
  void,
  ApiError,
  { email: string; code: string; new_password: string }
> {
  return useMutation({
    mutationFn: resetPasswordAccount,
    ...useInvalidateSession<void>(),
  });
}

export function useChangePassword(): UseMutationResult<
  void,
  ApiError,
  { current_password: string; new_password: string }
> {
  return useMutation({     meta: { successToast: "auth.password" },
mutationFn: changePasswordAccount });
}

export interface RegisterFlowOutcome {
  dest: "home" | "login";
  avatarError?: string;
}

// Orchestrates the register wizard finish: create the account, open the
// session, then push the optional avatar through the shared profile upload
// (the same field /manage/volunteer edits). Only the register call throws;
// login and avatar failures degrade to outcomes so the flow never strands
// a freshly created account.
export function useRegisterFlow(
  avatarSavedTitle: string,
): UseMutationResult<
  RegisterFlowOutcome,
  ApiError,
  { form: RegisterForm; avatar: File | null }
> {
  const register = useRegister();
  const login = useLogin();
  const avatarUpload = useUploadAvatar(avatarSavedTitle);
  return useMutation({
    mutationFn: async ({ form, avatar }): Promise<RegisterFlowOutcome> => {
      const email = form.email.trim().toLowerCase();
      await register.mutateAsync({
        email,
        phone: form.phone.replace(/[\s.]/g, ""),
        password: form.password,
        full_name: form.fullName.trim(),
        account_type: form.accountType,
        ...(form.accountType === "business"
          ? {
              tax_code: form.taxCode.trim(),
              company_name: form.companyName.trim(),
              legal_rep_name: form.legalRepName.trim(),
              legal_rep_id: form.legalRepId.trim(),
              legal_rep_position: form.legalRepPosition.trim() || undefined,
            }
          : {}),
      });
      try {
        await login.mutateAsync({ email, password: form.password });
      } catch {
        return { dest: "login" };
      }
      if (avatar) {
        try {
          await avatarUpload.mutateAsync(avatar);
        } catch (error) {
          return {
            dest: "home",
            avatarError:
              error instanceof ApiError ? error.code : "REQUEST_FAILED",
          };
        }
      }
      return { dest: "home" };
    },
  });
}

export function useAuthSessions(): UseQueryResult<AuthSession[]> {
  return useQuery({
    queryKey: sessionKeys.list(),
    queryFn: listAuthSessions,
    staleTime: 30_000,
  });
}

export function useRevokeAuthSession(): UseMutationResult<
  void,
  ApiError,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: "auth.sessionRevoked" },
    mutationFn: revokeAuthSession,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}
