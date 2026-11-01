// Runs once when the Next.js server starts and logs whether the backend API answers.
const BACKEND_URL = process.env.BACKEND_URL;
const HEALTH_PATH = "/openapi.json";
const TIMEOUT_MS = 3000;

function timestamp(): string {
  return new Date().toTimeString().slice(0, 8);
}

function describeError(error: unknown): string {
  const cause = error instanceof Error ? error.cause : undefined;
  if (cause instanceof Error && "code" in cause) {
    return String(cause.code);
  }
  if (error instanceof Error) {
    return error.name === "TimeoutError" ? "timeout" : error.message;
  }
  return String(error);
}

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}${HEALTH_PATH}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (response.ok) {
      console.info(
        `${timestamp()} INFO  Backend API connected: ${BACKEND_URL}`,
      );
    } else {
      console.error(
        `${timestamp()} ERROR Backend API returned HTTP ${response.status}: ${BACKEND_URL}`,
      );
    }
  } catch (error) {
    console.error(
      `${timestamp()} ERROR Backend API unreachable: ${BACKEND_URL} (${describeError(error)})`,
    );
  }
}
