import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import {
  changePasswordAccount,
  clearSessionToken,
  fetchSession,
  forgotPasswordAccount,
  loginAccount,
  logoutAccount,
  logoutAllSessions,
  registerAccount,
  resendVerificationCode,
  resetPasswordAccount,
  verifyEmailAccount,
  type RegisterInput,
  type SessionProfile,
} from "./api.ts";
import { authKeys } from "./keys.ts";

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
  return useMutation({ mutationFn: resendVerificationCode });
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
  return useMutation({ mutationFn: changePasswordAccount });
}
