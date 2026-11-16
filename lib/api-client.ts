/** Shared JSON request handling and API error presentation for browser-side calls. */

export type ApiPayload = Record<string, unknown>;

export interface JsonResponse<T extends ApiPayload = ApiPayload> {
  response: Response;
  data: T;
}

export async function requestJson<T extends ApiPayload = ApiPayload>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<JsonResponse<T>> {
  const response = await fetch(input, init);
  const payload: unknown = await response.json().catch(() => null);
  const data = payload && typeof payload === "object" && !Array.isArray(payload)
    ? payload as T
    : {} as T;

  return { response, data };
}

export function readApiString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function readApiNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function getPairingRequestErrorMessage(
  error?: string,
  retryAfterMs = 0,
): string {
  const waitSeconds = Math.max(0, Math.ceil(retryAfterMs / 1000));

  switch (error) {
    case "cooldown":
      return `انتظر ${waitSeconds} ثانية قبل المحاولة مرة أخرى.`;
    case "phone_limit":
      return "استهلكت المحاولات الخمس لهذا الرقم خلال الساعة. يمكنك بدء اقتران جديد بعد انتهاء المهلة.";
    case "ip_limit":
      return "تم تقييد الشبكة مؤقتًا. حاول لاحقًا.";
    case "invalid_response":
      return "استجابة الخادم غير مكتملة. لم يتم بدء جلسة الاقتران؛ حاول مرة أخرى.";
    case "bot_service_not_configured":
      return "إعدادات الاتصال بالخادم غير مكتملة.";
    case "invalid_phone":
      return "رقم الهاتف غير صالح. راجع الرقم وكود الدولة.";
    case "forbidden":
      return "تعذر التحقق من مصدر الطلب. حدّث الصفحة وحاول مرة أخرى.";
    case "bot_unreachable":
    case "network_error":
      return "تعذر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى.";
    default:
      return "حدث خطأ غير متوقع. حاول لاحقًا.";
  }
}

export function getSessionCheckErrorMessage(
  error?: string,
  retryAfterMs = 0,
): string {
  const waitSeconds = Math.max(0, Math.ceil(retryAfterMs / 1000));

  switch (error) {
    case "too_many_checks":
      return waitSeconds > 0
        ? `طلبات التحقق كثيرة. أعد المحاولة بعد ${waitSeconds} ثانية.`
        : "طلبات التحقق كثيرة. انتظر قليلًا ثم أعد المحاولة.";
    case "session_not_found":
      return "جلسة الاقتران غير موجودة أو انتهت صلاحيتها.";
    case "invalid_session":
      return "معرّف جلسة الاقتران غير صالح.";
    case "bot_service_not_configured":
      return "إعدادات الاتصال بالخادم غير مكتملة.";
    case "forbidden":
      return "تعذر التحقق من مصدر الطلب. حدّث الصفحة وحاول مرة أخرى.";
    case "bot_unreachable":
    case "network_error":
      return "تعذر الاتصال بالخادم. ستستمر محاولة التحقق تلقائيًا.";
    default:
      return "تعذر التحقق مؤقتًا. ستستمر محاولة التحقق تلقائيًا.";
  }
}
