"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Loader2, AlertCircle, Smartphone, KeyRound, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { requestPairing, checkSession } from "@/lib/mock-api";

type Step = 1 | 2 | 3;

export default function PairingFlow() {
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState(0);
  const [serverOffset, setServerOffset] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [remainingSec, setRemainingSec] = useState(60);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [verifyState, setVerifyState] = useState<"idle" | "awaiting" | "confirmed" | "expired">("idle");
  const [isVerifying, setIsVerifying] = useState(false);
  const isVerifyingRef = useRef(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState("");
  const [rateLimit, setRateLimit] = useState("");
  const [copied, setCopied] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const serverNow = () => Date.now() + serverOffset;
  const syncTime = (t?: number) => {
    if (typeof t === "number") setServerOffset(t - Date.now());
  };

  /* ===== Timer ===== */
  useEffect(() => {
    if (!sessionId) return;
    timerRef.current = setInterval(() => {
      const rem = Math.max(0, expiresAt - serverNow());
      setRemainingSec(Math.ceil(rem / 1000));
      if (rem <= 0) {
        clearInterval(timerRef.current!);
        if (verifyState === "awaiting") setVerifyState("expired");
      }
    }, 200);
    return () => clearInterval(timerRef.current!);
  }, [sessionId, expiresAt, verifyState]);

  /* ===== Cooldown ===== */
  useEffect(() => {
    if (!cooldownUntil) return;
    cooldownRef.current = setInterval(() => {
      const rem = Math.max(0, cooldownUntil - serverNow());
      setCooldownSec(Math.ceil(rem / 1000));
      if (rem <= 0) clearInterval(cooldownRef.current!);
    }, 500);
    return () => clearInterval(cooldownRef.current!);
  }, [cooldownUntil]);

  /* ===== Polling ===== */
  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  }, []);

  const verify = useCallback(
    async (auto = false) => {
      if (!sessionId || isVerifyingRef.current) return;
      isVerifyingRef.current = true;
      setIsVerifying(true);
      try {
        const res = await checkSession({ sessionId });
        syncTime(res.serverTime);
        if (res.code) setCode(res.code);
        if (!res.ok) {
          setVerifyState("expired");
          stopPolling();
          return;
        }
        if (res.status === "confirmed") {
          setVerifyState("confirmed");
          stopPolling();
          setTimeout(() => setStep(3), 800);
          return;
        }
        if (res.status === "expired") {
          setVerifyState("expired");
          stopPolling();
          return;
        }
        if (!auto) {
          setRateLimit("لم يتم التأكيد بعد. تأكد من إدخال الرمز في واتساب.");
        }
      } finally {
        isVerifyingRef.current = false;
        setIsVerifying(false);
      }
    },
    [sessionId, stopPolling]
  );

  // Start polling only after React has committed the new sessionId.
  useEffect(() => {
    if (!sessionId) return;
    stopPolling();
    void verify(true);
    pollRef.current = setInterval(() => void verify(true), 1500);
    return stopPolling;
  }, [sessionId, verify, stopPolling]);

  /* ===== Generate ===== */
  const handleGenerate = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    setError("");
    setRateLimit("");

    try {
      const res = await requestPairing({
        phone,
        captchaAnswer: captchaExpected !== null ? captchaInput : undefined,
        captchaExpected: captchaExpected ?? undefined,
      });
      syncTime(res.serverTime);

      if (res.ok) {
        setSessionId(res.sessionId!);
        setCode(res.code || null);
        setExpiresAt(res.expiresAt!);
        setCooldownUntil(res.nextAllowedAt!);
        setVerifyState("awaiting");
        setStep(2);
        return;
      }

      if (res.error === "cooldown") {
        setCooldownUntil(serverNow() + (res.retryAfterMs || 0));
        setRateLimit(`انتظر ${Math.ceil((res.retryAfterMs || 0) / 1000)} ثانية قبل المحاولة مرة أخرى.`);
        return;
      }
      if (res.error === "phone_limit") {
        stopPolling();
        setSessionId(null);
        setCode(null);
        setExpiresAt(0);
        setStep(1);
        setRateLimit("استهلكت المحاولات الخمس لهذا الرقم خلال الساعة. يمكنك بدء اقتران جديد بعد انتهاء المهلة.");
        return;
      }
      if (res.error === "ip_limit") {
        setRateLimit("تم تقييد الشبكة مؤقتًا. حاول لاحقًا.");
        return;
      }
      setError("حدث خطأ غير متوقع. حاول لاحقًا.");
    } catch {
      setError("تعذر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى.");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleRetry = () => {
    if (isRequesting || cooldownSec > 0 || !phone) return;

    stopPolling();
    isVerifyingRef.current = false;
    setSessionId(null);
    setCode(null);
    setExpiresAt(0);
    setRemainingSec(60);
    setVerifyState("idle");
    setError("");
    setRateLimit("");
    void handleGenerate();
  };

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const reset = () => {
    stopPolling();
    isVerifyingRef.current = false;
    setIsRequesting(false);
    setStep(1);
    setPhone("");
    setSessionId(null);
    setCode(null);
    setExpiresAt(0);
    setCooldownUntil(0);
    setVerifyState("idle");
    setError("");
    setRateLimit("");
    setCaptchaExpected(null);
    setCaptchaInput("");
  };

  const canGenerate = phone.replace(/\D/g, "").length >= 10;

  return (
    <div className="space-y-5">
      {/* Steps */}
      <div className="flex items-center px-1">
        {[1, 2, 3].map((n, i) => (
          <div key={n} className="flex flex-1 items-center">
            <div className="flex shrink-0 items-center gap-2">
              <div
                className={cn(
                  "grid size-7 place-items-center rounded-full border text-[11px] font-semibold transition-all",
                  step === n && "border-primary bg-primary/10 text-primary",
                  step > n && "border-primary bg-primary text-bg",
                  step < n && "border-border text-text-3"
                )}
              >
                {step > n ? <Check size={13} strokeWidth={3} /> : n}
              </div>
              <span
                className={cn(
                  "text-[12px] font-medium whitespace-nowrap transition-colors",
                  step === n && "text-text",
                  step > n && "text-text-2",
                  step < n && "text-text-3"
                )}
              >
                {n === 1 ? "الرقم" : n === 2 ? "الاقتران" : "جاهز"}
              </span>
            </div>
            {i < 2 && (
              <div className="mx-2.5 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full origin-right bg-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: step > n ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ===== Screen 1 ===== */}
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="lg lg-surface rounded-glass p-5">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-text-2">
                رقم الهاتف مع كود الدولة
              </label>
              <div className="flex items-center overflow-hidden rounded-glass-sm border border-input bg-input" dir="ltr">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 15);
                    setPhone(digits);
                    setError("");
                  }}
                  placeholder="20xxxxxxxxx"
                  inputMode="numeric"
                  maxLength={16}
                  className="flex-1 bg-transparent px-4 py-3.5 font-body text-base font-medium tracking-wider text-text outline-none placeholder:text-text-3"
                />
                {phone && (
                  <button
                    onClick={() => setPhone("")}
                    className="mr-2 grid size-6 place-items-center rounded-full bg-surface-3 text-text-2 hover:bg-text-3 hover:text-text"
                    aria-label="مسح"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-text-3">
                <AlertCircle size={12} className="opacity-70" />
                اكتب كود الدولة ثم رقمك — بدون + أو مسافات
              </p>
              {error && (
                <p role="alert" className="mt-2 text-[11.5px] font-medium text-danger">
                  {error}
                </p>
              )}
            </div>

            {rateLimit && (
              <p role="alert" className="rounded-glass-sm border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-[12.5px] font-medium text-danger">
                {rateLimit}
              </p>
            )}

            <button
              onClick={handleGenerate}
              disabled={!canGenerate || isRequesting}
              className={cn(
                "relative w-full overflow-hidden rounded-glass-sm border border-[#B5543A] bg-gradient-to-b from-[#E5876B] via-primary to-primary-hover px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all",
                "hover:-translate-y-px hover:shadow-xl active:translate-y-px disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
              )}
            >
              {isRequesting ? "جاري طلب رمز الاقتران..." : "توليد رمز الاقتران"}
            </button>
          </motion.div>
        )}

        {/* ===== Screen 2 ===== */}
        {step === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Code panel */}
            <div
              onClick={copyCode}
              className={cn(
                "lg lg-surface cursor-pointer rounded-glass p-5 text-center transition-transform active:scale-[0.995]",
                !code && "cursor-default"
              )}
            >
              <div className="mb-3 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-3">
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "تم النسخ!" : code ? "رمز الاقتران المكوّن من 8 أرقام" : "جاري استلام رمز الاقتران"}
              </div>
              <div className="flex justify-center gap-1.5" dir="ltr">
                {code
                  ? code.split("").map((d, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 8, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="grid h-12 w-8 place-items-center rounded-[10px] border border-border bg-surface-2 font-display text-xl font-bold text-text sm:h-14 sm:w-10 sm:text-2xl"
                      >
                        {d}
                      </motion.span>
                    ))
                  : Array.from({ length: 8 }).map((_, i) => (
                      <span
                        key={i}
                        className="grid h-12 w-8 place-items-center rounded-[10px] border border-border bg-surface-2 sm:h-14 sm:w-10"
                      >
                        <span className="h-5 w-4 animate-pulse rounded bg-text-3/25" />
                      </span>
                    ))}
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="relative size-5">
                  <svg className="size-5 -rotate-90" viewBox="0 0 22 22">
                    <circle cx="11" cy="11" r="9" fill="none" stroke="var(--border)" strokeWidth="2.5" />
                    <circle
                      cx="11"
                      cy="11"
                      r="9"
                      fill="none"
                      stroke={remainingSec <= 0 ? "#E8A55A" : "#D97757"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={56.55}
                      strokeDashoffset={56.55 * (1 - Math.min(1, Math.max(0, remainingSec / 60)))}
                      className="transition-all duration-200"
                    />
                  </svg>
                </div>
                <span className={cn("text-[11.5px]", remainingSec <= 0 ? "text-gold" : "text-text-3")} dir="ltr">
                  {remainingSec > 0 ? `${remainingSec} ثانية` : "انتهى الرمز"}
                </span>
              </div>
            </div>

            {/* Verify status */}
            {verifyState !== "idle" && (
              <div
                role="status"
                aria-live="polite"
                className={cn(
                  "flex items-center gap-2 rounded-glass-sm border px-3.5 py-2.5 text-[12.5px] font-medium",
                  verifyState === "awaiting" && "border-primary/25 bg-primary/10 text-primary",
                  verifyState === "confirmed" && "border-green/30 bg-green/10 text-green",
                  verifyState === "expired" && "border-gold/35 bg-gold/10 text-gold"
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    verifyState === "awaiting" && "animate-pulse-soft bg-primary",
                    verifyState === "confirmed" && "bg-green",
                    verifyState === "expired" && "bg-gold"
                  )}
                />
                {verifyState === "awaiting" && "في انتظار تأكيد الربط من واتساب..."}
                {verifyState === "confirmed" && "تم التأكيد من الخادم ✓"}
                {verifyState === "expired" && "انتهت صلاحية الرمز. اطلب رمزًا جديدًا."}
              </div>
            )}

            {rateLimit && (
              <p role="alert" className="rounded-glass-sm border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-[12.5px] font-medium text-danger">
                {rateLimit}
              </p>
            )}

            {/* Instructions */}
            <ol className="lg lg-surface space-y-3 rounded-glass p-4">
              {[
                { icon: Smartphone, text: "افتح واتساب على هاتفك" },
                { icon: KeyRound, text: "اذهب إلى الإعدادات ← الأجهزة المرتبطة ← ربط جهاز" },
                { icon: ShieldCheck, text: "اختر الربط برقم الهاتف وأدخل الرمز أعلاه" },
              ].map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-text-2">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-primary/25 bg-primary/10 text-[10px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: text.replace(/(واتساب|الإعدادات ← الأجهزة المرتبطة ← ربط جهاز|الربط برقم الهاتف)/g, "<strong class='font-semibold text-text'>$1</strong>") }} />
                </li>
              ))}
            </ol>

            <button
              onClick={() => verify(false)}
              disabled={!sessionId || isVerifying}
              className="flex w-full items-center justify-center gap-2 rounded-glass-sm border border-[#B5543A] bg-gradient-to-b from-[#E5876B] via-primary to-primary-hover px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-px active:translate-y-px disabled:cursor-not-allowed disabled:opacity-35"
            >
              {isVerifying && <Loader2 size={14} className="animate-spin" />}
              {isVerifying ? "جاري التحقّق..." : "تحقّق الآن"}
            </button>

            <button
              onClick={handleRetry}
              disabled={cooldownSec > 0 || isRequesting}
              className="w-full rounded-glass-sm border border-border bg-surface px-5 py-3 text-[13px] font-medium text-text-2 transition-all hover:bg-surface-2 hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isRequesting
                ? "جاري طلب رمز جديد..."
                : cooldownSec > 0
                  ? `انتظر ${cooldownSec} ثانية`
                  : "لم ينجح؟ طلب رمز جديد"}
            </button>
          </motion.div>
        )}

        {/* ===== Screen 3 ===== */}
        {step === 3 && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5 text-center"
          >
            <div className="lg lg-surface mx-auto max-w-sm rounded-glass p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-green shadow-lg shadow-green/30"
              >
                <Check size={40} strokeWidth={3} className="text-white" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold">تم ربط البوت بنجاح</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-2">
                رقمك الآن مرتبط بالبوت. يمكنك البدء في استخدامه فورًا من تطبيق واتساب.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-pill border border-green/30 bg-green/10 px-3.5 py-1.5 text-xs font-medium text-green">
                <span className="size-1.5 rounded-full bg-green" />
                الحالة: جاهز ومتصل
              </div>
            </div>
            <button
              onClick={reset}
              className="w-full rounded-glass-sm border border-[#B5543A] bg-gradient-to-b from-[#E5876B] via-primary to-primary-hover px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-px"
            >
              تنصيب رقم آخر
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
