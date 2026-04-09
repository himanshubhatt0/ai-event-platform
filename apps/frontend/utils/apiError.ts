import type { AxiosError } from 'axios';

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

function normalizeMessage(message: unknown): string | null {
  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (Array.isArray(message)) {
    const joined = message
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .join(', ')
      .trim();

    return joined || null;
  }

  return null;
}

export function extractApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const axiosError = error as AxiosError<ApiErrorBody>;
  const payload = axiosError?.response?.data;

  const payloadMessage = normalizeMessage(payload?.message);
  if (payloadMessage) {
    return payloadMessage;
  }

  const payloadError = normalizeMessage(payload?.error);
  if (payloadError) {
    return payloadError;
  }

  const directMessage = normalizeMessage((error as Error | undefined)?.message);
  if (directMessage) {
    return directMessage;
  }

  return fallback;
}
