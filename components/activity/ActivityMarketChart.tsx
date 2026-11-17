"use client";

import { useMemo } from "react";

type Event = { id: string; at: string; status: "success" | "failed" | "info" };

const INTERVAL = 5 * 60 * 1000;
const MINUTE = 60 * 1000;
const BUCKETS = 12;

export default function ActivityMarketChart({ events }: { events: Event[] }) {
  const chart = useMemo(() => {
    const now = Date.now();
    const end = Math.floor(now / INTERVAL) * INTERVAL + INTERVAL;
    const start = end - BUCKETS * INTERVAL;
    const buckets = Array.from({ length: BUCKETS }, (_, index) => ({
      start: start + index * INTERVAL,
      minutes: [0, 0, 0, 0, 0],
      volume: 0,
    }));

    for (const event of events) {
      const timestamp = new Date(event.at).getTime();
      if (!Number.isFinite(timestamp) || timestamp < start || timestamp >= end) continue;
      const index = Math.floor((timestamp - start) / INTERVAL);
      const minuteIndex = Math.min(4, Math.floor((timestamp - buckets[index].start) / MINUTE));
      buckets[index].minutes[minuteIndex] += 1;
      buckets[index].volume += 1;
    }

    const candles = buckets.map((bucket) => ({
      ...bucket,
      open: bucket.minutes[0],
      close: bucket.minutes[4],
      high: Math.max(...bucket.minutes),
      low: Math.min(...bucket.minutes),
    }));
    const maxRate = Math.max(1, ...candles.map((candle) => candle.high));
    const maxVolume = Math.max(1, ...candles.map((candle) => candle.volume));
    return {
      candles,
      maxRate,
      maxVolume,
      total: candles.reduce((sum, candle) => sum + candle.volume, 0),
      start,
      end,
    };
  }, [events]);

  const left = 62;
  const right = 744;
  const top = 22;
  const bottom = 166;
  const volumeTop = 190;
  const volumeBottom = 235;
  const slot = (right - left) / BUCKETS;
  const y = (value: number) => bottom - (value / chart.maxRate) * (bottom - top);
  const volumeY = (value: number) => volumeBottom - (value / chart.maxVolume) * (volumeBottom - volumeTop);

  const formatTime = (value: number) =>
    new Intl.DateTimeFormat("ar-EG", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

  return (
    <section className="mt-5 border-y border-white/[0.10] py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[11px] font-semibold text-text">معدل النشاط</h2>
          <p className="mt-1 text-[9px] text-text-3">حركة الأحداث خلال آخر 60 دقيقة</p>
        </div>
        <div className="text-left">
          <strong className="block font-display text-xl tabular-nums text-text">{chart.total}</strong>
          <span className="text-[8px] tracking-wider text-text-3">EVENTS / 1H</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-[8px] text-text-3">
        <span>عدد الأحداث في الدقيقة</span>
        <span className="font-mono tracking-wider">5M · CANDLE</span>
      </div>

      <div className="mt-2 w-full">
        <svg viewBox="0 0 760 270" preserveAspectRatio="none" className="block h-[218px] w-full overflow-visible" role="img" aria-label="مخطط شموع يوضح معدل أحداث البوت خلال آخر ساعة، مع حجم الأحداث لكل فترة خمس دقائق">
          {[0, 1, 2, 3].map((step) => {
            const value = Math.round((chart.maxRate * (3 - step)) / 3);
            const lineY = top + ((bottom - top) * step) / 3;
            return (
              <g key={step}>
                <line x1={left} x2={right} y1={lineY} y2={lineY} stroke="currentColor" opacity=".13" strokeDasharray="3 6" />
                <text x="48" y={lineY + 3} fill="currentColor" opacity=".55" fontSize="10" textAnchor="end">{value}</text>
              </g>
            );
          })}

          {chart.candles.map((candle, index) => {
            const center = left + slot * (index + 0.5);
            const rising = candle.close > candle.open;
            const falling = candle.close < candle.open;
            const color = rising ? "#829b8b" : falling ? "#c27e83" : "#858b90";
            const bodyTop = Math.min(y(candle.open), y(candle.close));
            const bodyHeight = Math.max(2.5, Math.abs(y(candle.open) - y(candle.close)));
            const volumeHeight = volumeBottom - volumeY(candle.volume);
            return (
              <g key={candle.start}>
                <title>{formatTime(candle.start)} — {candle.volume} أحداث، افتتاح {candle.open}، أعلى {candle.high}، أدنى {candle.low}، إغلاق {candle.close}</title>
                <line x1={center} x2={center} y1={y(candle.high)} y2={y(candle.low)} stroke={color} strokeWidth="2" />
                <rect x={center - 9} y={bodyTop} width="18" height={bodyHeight} rx="2" fill={color} />
                <rect x={center - 11} y={volumeBottom - volumeHeight} width="22" height={Math.max(1, volumeHeight)} rx="1.5" fill={color} opacity=".55" />
              </g>
            );
          })}

          <line x1={left} x2={right} y1={volumeBottom} y2={volumeBottom} stroke="currentColor" opacity=".18" />
          {[0, 3, 6, 9, 12].map((index) => {
            const time = chart.start + index * INTERVAL;
            const x = left + slot * index;
            return <text key={index} x={x} y="258" fill="currentColor" opacity=".58" fontSize="10" textAnchor={index === 0 ? "start" : index === 12 ? "end" : "middle"}>{formatTime(time)}</text>;
          })}
          {chart.total === 0 && <text x="403" y="103" fill="currentColor" opacity=".55" fontSize="13" textAnchor="middle">لا توجد أحداث خلال آخر ساعة</text>}
        </svg>
      </div>

      <div className="mt-1 flex items-center justify-center gap-4 text-[8px] text-text-3">
        <span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-[1px] bg-[#829b8b]" />ارتفاع النشاط</span>
        <span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-[1px] bg-[#c27e83]" />انخفاض النشاط</span>
        <span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-[1px] bg-[#858b90]" />ثبات</span>
      </div>
    </section>
  );
}
