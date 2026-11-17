"use client";

import { useMemo, useState, type PointerEvent } from "react";
import { Activity, BarChart3, Clock3, Gauge } from "lucide-react";

type Event = { id: string; at: string; status: "success" | "failed" | "info" };
type Candle = { start: number; samples: number[]; open: number; close: number; high: number; low: number; volume: number; average: number; status: Event["status"] };

const COLORS = { success: "#C9F31D", failed: "#E47F88", info: "#92979B", line: "#D97757" };

function smoothPath(points: { x: number; y: number }[]) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index++) {
    const p0 = points[index - 1] || points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

function formatAxisTime(value: number) {
  return new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" }).format(new Date(value));
}

export default function ActivityMarketChart({ events }: { events: Event[] }) {
  const model = useMemo(() => {
    const now = Date.now();
    const valid = events
      .map((event) => ({ ...event, timestamp: new Date(event.at).getTime() }))
      .filter((event) => Number.isFinite(event.timestamp) && event.timestamp <= now);
    const oldest = valid.length ? Math.min(...valid.map((event) => event.timestamp)) : now;
    const duration = Math.max(60 * 60 * 1000, now - oldest);
    const start = now - duration;
    const bucketCount = 36;
    const bucketDuration = duration / bucketCount;
    const sampleDuration = bucketDuration / 5;
    const buckets = Array.from({ length: bucketCount }, (_, index) => ({
      start: start + index * bucketDuration,
      samples: [0, 0, 0, 0, 0],
      volume: 0,
      statusCounts: { success: 0, failed: 0, info: 0 },
    }));

    const visibleEvents = valid.filter((event) => event.timestamp >= start);
    for (const event of visibleEvents) {
      const offset = Math.max(0, event.timestamp - start);
      const bucketIndex = Math.min(bucketCount - 1, Math.floor(offset / bucketDuration));
      const withinBucket = offset - bucketIndex * bucketDuration;
      const sampleIndex = Math.min(4, Math.floor(withinBucket / sampleDuration));
      buckets[bucketIndex].samples[sampleIndex] += 1;
      buckets[bucketIndex].volume += 1;
      buckets[bucketIndex].statusCounts[event.status] += 1;
    }

    const candles: Candle[] = buckets.map((bucket, index) => ({
      ...bucket,
      open: bucket.samples[0],
      close: bucket.samples[4],
      high: Math.max(...bucket.samples),
      low: Math.min(...bucket.samples),
      average: candlesAverage(buckets, index),
      status: bucket.volume === 0 ? "info" : ([["success", bucket.statusCounts.success], ["failed", bucket.statusCounts.failed], ["info", bucket.statusCounts.info]] as [Event["status"], number][]).sort((a, b) => b[1] - a[1])[0][0],
    }));

    const maxRate = Math.max(1, ...candles.map((candle) => candle.high), ...candles.map((candle) => candle.average));
    const maxVolume = Math.max(1, ...candles.map((candle) => candle.volume));
    const total = visibleEvents.length;
    return {
      candles,
      maxRate,
      maxVolume,
      total,
      high: Math.max(0, ...candles.map((candle) => candle.volume)),
      low: Math.min(...candles.map((candle) => candle.volume)),
      average: total / bucketCount,
      duration,
      start,
      lastActiveIndex: candles.reduce((last, candle, index) => candle.volume > 0 ? index : last, -1),
    };
  }, [events]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const left = 24;
  const right = 662;
  const top = 30;
  const plotBottom = 216;
  const volumeTop = 246;
  const volumeBottom = 294;
  const slot = (right - left) / model.candles.length;
  const selectedIndex = activeIndex === null ? model.lastActiveIndex : activeIndex;
  const selectedCandle = selectedIndex >= 0 ? model.candles[selectedIndex] : null;
  const selectedX = selectedCandle ? left + slot * (selectedIndex + 0.5) : 0;
  const selectedColor = selectedCandle ? COLORS[selectedCandle.status] : COLORS.info;
  const selectedLabel = selectedCandle?.status === "success" ? "ناجح" : selectedCandle?.status === "failed" ? "فشل" : "معلومات";
  const handlePointer = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const chartX = ((event.clientX - rect.left) / rect.width) * 760;
    const index = Math.floor((chartX - left) / slot);
    const nextIndex = Math.max(0, Math.min(model.candles.length - 1, index));
    setActiveIndex((current) => current === nextIndex ? current : nextIndex);
  };
  const y = (value: number) => plotBottom - (value / model.maxRate) * (plotBottom - top);
  const volumeY = (value: number) => volumeBottom - (value / model.maxVolume) * (volumeBottom - volumeTop);
  const points = model.candles.map((candle, index) => ({
    x: left + slot * (index + 0.5),
    y: y(candle.average),
  }));
  const linePath = smoothPath(points);
  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x} ${plotBottom} L ${points[0].x} ${plotBottom} Z`
    : "";

  return (
    <section className="space-y-3">
      <div className="overflow-hidden rounded-[25px] border border-white/[0.12] bg-surface/25 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold text-text">حركة النشاط</h2>
            <p className="mt-1 text-[9px] text-text-3">شموع تصنيف الأحداث وحجم النشاط</p>
          </div>
          <div className="text-left">
            <span className="block font-mono text-[9px] tracking-wider text-text-3">EVENT FLOW</span>
            <span className="mt-1 block text-[10px] text-text-2">{model.total.toLocaleString("en-US")} حدث</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-[8px] text-text-3">
          <span>معدل الأحداث</span>
          <span>الحجم أسفل الرسم</span>
        </div>

        <svg
          viewBox="0 0 760 326"
          preserveAspectRatio="none"
          className="mt-1 block h-[225px] w-full touch-none select-none overflow-visible outline-none focus-visible:ring-1 focus-visible:ring-primary/50 sm:h-[280px]"
          role="group"
          tabIndex={0}
          aria-label="رسم تفاعلي. اسحب أفقياً أو استخدم الأسهم لاستعراض الشموع."
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); handlePointer(event); }}
          onPointerMove={handlePointer}
          onPointerLeave={(event) => { if (event.pointerType === "mouse") setActiveIndex(null); }}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            const current = selectedIndex < 0 ? 0 : selectedIndex;
            setActiveIndex(Math.max(0, Math.min(model.candles.length - 1, current + (event.key === "ArrowRight" ? 1 : -1))));
          }}
        >
          <defs>
            <linearGradient id="activityArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={COLORS.line} stopOpacity=".20" />
              <stop offset="100%" stopColor={COLORS.line} stopOpacity="0" />
            </linearGradient>
            <filter id="activityGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {[0, 1, 2, 3, 4].map((step) => {
            const value = model.maxRate * (4 - step) / 4;
            const lineY = top + (plotBottom - top) * step / 4;
            return (
              <g key={step}>
                <line x1={left} x2={right} y1={lineY} y2={lineY} stroke="currentColor" opacity=".13" strokeDasharray="3 6" />
                <text x="750" y={lineY + 3} fill="currentColor" opacity=".62" fontSize="10" textAnchor="end">{Math.round(value * 10) / 10}</text>
              </g>
            );
          })}

          {[0, 9, 18, 27, 35].map((index) => {
            const x = left + slot * (index + 0.5);
            return <line key={index} x1={x} x2={x} y1={top} y2={volumeBottom} stroke="currentColor" opacity=".055" />;
          })}

          {areaPath && <path d={areaPath} fill="url(#activityArea)" />}
          {model.candles.map((candle, index) => {
            const center = left + slot * (index + 0.5);
            const color = COLORS[candle.status];
            const bodyTop = Math.min(y(candle.open), y(candle.close));
            const bodyHeight = Math.max(2, Math.abs(y(candle.open) - y(candle.close)));
            const volumeHeight = volumeBottom - volumeY(candle.volume);
            return (
              <g key={candle.start}>
                <title>{formatAxisTime(candle.start)}: حجم {candle.volume}، التصنيف {candle.status === "success" ? "ناجح" : candle.status === "failed" ? "فشل" : "معلومات"}، افتتاح {candle.open}، أعلى {candle.high}، أدنى {candle.low}، إغلاق {candle.close}</title>
                <line x1={center} x2={center} y1={y(candle.high)} y2={y(candle.low)} stroke={color} strokeWidth="1.6" />
                <rect x={center - Math.max(3, slot * .23)} y={bodyTop} width={Math.max(6, slot * .46)} height={bodyHeight} rx="1.5" fill={color} />
                <rect x={center - Math.max(3, slot * .23)} y={volumeBottom - volumeHeight} width={Math.max(6, slot * .46)} height={Math.max(1, volumeHeight)} rx="1.5" fill={color} opacity=".55" />
              </g>
            );
          })}

          {model.total > 0 && <path d={linePath} fill="none" stroke={COLORS.line} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" filter="url(#activityGlow)" vectorEffect="non-scaling-stroke" />}
          {selectedCandle && <g pointerEvents="none">
            <line x1={selectedX} x2={selectedX} y1={top} y2={volumeBottom} stroke={selectedColor} strokeWidth="1.2" strokeDasharray="4 4" opacity=".9" />
            <circle cx={selectedX} cy={y(selectedCandle.close)} r="8" fill={selectedColor} opacity=".2" />
            <circle cx={selectedX} cy={y(selectedCandle.close)} r="4" fill={selectedColor} stroke="var(--theme-bg, #151515)" strokeWidth="2" />
            <rect x={Math.max(left, Math.min(right - 112, selectedX - 56))} y="5" width="112" height="37" rx="9" fill="var(--theme-surface, #292929)" stroke={selectedColor} strokeOpacity=".8" />
            <text x={Math.max(left, Math.min(right - 112, selectedX - 56)) + 56} y="20" fill="currentColor" fontSize="9" textAnchor="middle">{formatAxisTime(selectedCandle.start)}</text>
            <text x={Math.max(left, Math.min(right - 112, selectedX - 56)) + 56} y="33" fill={selectedColor} fontSize="10" fontWeight="600" textAnchor="middle">{selectedCandle.volume} حدث · {selectedLabel}</text>
          </g>}

          <line x1={left} x2={right} y1={volumeBottom} y2={volumeBottom} stroke="currentColor" opacity=".2" />
          {[0, 9, 18, 27, 35].map((index) => {
            const time = model.start + model.duration * index / 36;
            const x = left + slot * (index + .5);
            return <text key={index} x={x} y="319" fill="currentColor" opacity=".62" fontSize="10" textAnchor="middle">{formatAxisTime(time)}</text>;
          })}
          {model.total === 0 && <text x="343" y="125" fill="currentColor" opacity=".6" fontSize="13" textAnchor="middle">لا توجد أحداث في هذه الفترة</text>}
        </svg>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-black/10 px-3 py-2 text-[9px]">
          {selectedCandle ? (
            <>
              <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: selectedColor }}>
                <i className="size-1.5 rounded-full" style={{ background: selectedColor }} />
                {selectedLabel}
              </span>
              <span className="text-text-2">{formatAxisTime(selectedCandle.start)}</span>
              <span className="text-text-2">عدد الأحداث: <b className="font-mono text-text">{selectedCandle.volume}</b></span>
              <span className="text-text-2">الإغلاق: <b className="font-mono text-text">{selectedCandle.close}</b></span>
            </>
          ) : <span className="text-text-3">لا توجد أحداث لعرض تفاصيلها.</span>}
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[8px] text-text-3">
          <span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-[1px]" style={{ background: COLORS.success }} />ناجح</span>
          <span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-[1px]" style={{ background: COLORS.failed }} />فشل</span>
          <span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-[1px]" style={{ background: COLORS.info }} />معلومات</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-[2px] w-3 rounded-full" style={{ background: COLORS.line }} />متوسط متحرك</span>
        </div>
      </div>

      <div dir="ltr" className="grid grid-cols-4 overflow-hidden rounded-[22px] border border-white/[0.12] bg-surface/35 py-3">
        <div className="min-w-0 border-l border-white/[0.09] px-1.5 text-center sm:px-3">
          <BarChart3 className="mx-auto mb-1.5 size-4 text-text-2" />
          <div className="truncate text-[8px] text-text-3 sm:text-[10px]">الحجم</div>
          <strong className="mt-1 block font-display text-sm tabular-nums text-text sm:text-base">{model.total.toLocaleString("en-US")}</strong>
        </div>
        <div className="min-w-0 border-l border-white/[0.09] px-1.5 text-center sm:px-3">
          <Gauge className="mx-auto mb-1.5 size-4 text-text-2" />
          <div className="truncate text-[8px] text-text-3 sm:text-[10px]">أعلى نشاط</div>
          <strong className="mt-1 block font-display text-sm tabular-nums text-text sm:text-base">{model.high}</strong>
        </div>
        <div className="min-w-0 border-l border-white/[0.09] px-1.5 text-center sm:px-3">
          <Activity className="mx-auto mb-1.5 size-4 text-text-2" />
          <div className="truncate text-[8px] text-text-3 sm:text-[10px]">أهدأ فترة</div>
          <strong className="mt-1 block font-display text-sm tabular-nums text-text sm:text-base">{model.low}</strong>
        </div>
        <div className="min-w-0 px-1.5 text-center sm:px-3">
          <Clock3 className="mx-auto mb-1.5 size-4 text-text-2" />
          <div className="truncate text-[8px] text-text-3 sm:text-[10px]">متوسط الحجم</div>
          <strong className="mt-1 block font-display text-sm tabular-nums text-text sm:text-base">{model.average.toFixed(1)}</strong>
        </div>
      </div>
    </section>
  );
}

function candlesAverage(buckets: { samples: number[] }[], index: number) {
  const start = Math.max(0, index - 3);
  let total = 0;
  let count = 0;
  for (let cursor = start; cursor <= index; cursor++) {
    total += buckets[cursor].samples.reduce((sum, value) => sum + value, 0) / buckets[cursor].samples.length;
    count++;
  }
  return count ? total / count : 0;
}
