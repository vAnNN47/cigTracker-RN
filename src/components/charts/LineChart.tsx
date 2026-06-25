/**
 * Responsive line chart on react-native-svg (no chart lib, no rebuild).
 * Approximates fl_chart's look: gridlines, Y-axis numbers, X-axis labels,
 * smooth (curved) lines, and a translucent area fill — plus optional dots
 * (e.g. over-limit days) on the first series.
 */
import { useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import Svg, { Circle, Line as SvgLine, Path, Text as SvgText } from "react-native-svg";

import { colors } from "@/theme";

export interface ChartSeries {
  points: number[];
  color: string;
  dashed?: boolean;
  fill?: boolean; // translucent area under the line
}

interface LineChartProps {
  series: ChartSeries[];
  height?: number;
  overMask?: boolean[];
  overColor?: string;
  min?: number;
  /** One label per data index; the chart shows ~4 evenly spaced. */
  xLabels?: string[];
  /** Format Y-axis tick labels. */
  formatY?: (v: number) => string;
  yTicks?: number;
  /** Gridline + axis-label colors (default to the dark theme). */
  gridColor?: string;
  labelColor?: string;
}

type Pt = { x: number; y: number };

// Catmull-Rom -> cubic bezier for a smooth curve.
function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function pickIdxs(len: number, k: number): number[] {
  if (len <= 0) return [];
  if (len <= k) return Array.from({ length: len }, (_, i) => i);
  const out = new Set<number>();
  for (let i = 0; i < k; i++) out.add(Math.round((i * (len - 1)) / (k - 1)));
  return [...out];
}

/** Responsive multi-series line chart (SVG): smooth curves, gridlines, optional fill/dots. */
export function LineChart({
  series,
  height = 170,
  overMask,
  overColor = "#FF7A7A",
  min,
  xLabels,
  formatY = (v) => String(Math.round(v)),
  yTicks = 4,
  gridColor = colors.line,
  labelColor = colors.textDim,
}: LineChartProps) {
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  const all = series.flatMap((s) => s.points);
  const dataMin = all.length ? Math.min(...all) : 0;
  const dataMax = all.length ? Math.max(...all) : 1;
  const yMin = min ?? Math.min(0, dataMin);
  const yMax = Math.max(yMin + 1, dataMax);
  const n = Math.max(1, ...series.map((s) => s.points.length));

  const padL = 34;
  const padR = 8;
  const padT = 10;
  const padB = xLabels ? 18 : 8;
  const plotW = Math.max(0, w - padL - padR);
  const plotH = height - padT - padB;

  const x = (i: number) => padL + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const pts = (arr: number[]): Pt[] => arr.map((v, i) => ({ x: x(i), y: y(v) }));

  const labelIdxs = xLabels ? pickIdxs(xLabels.length, 4) : [];

  return (
    <View onLayout={onLayout} style={{ height }}>
      {w > 0 && (
        <Svg width={w} height={height}>
          {/* gridlines + Y labels */}
          {Array.from({ length: yTicks + 1 }, (_, k) => {
            const gy = padT + (k / yTicks) * plotH;
            return (
              <SvgLine
                key={`g${k}`}
                x1={padL}
                y1={gy}
                x2={w - padR}
                y2={gy}
                stroke={gridColor}
                strokeWidth={1}
              />
            );
          })}
          {Array.from({ length: yTicks + 1 }, (_, k) => {
            const gy = padT + (k / yTicks) * plotH;
            const val = yMax - (k / yTicks) * (yMax - yMin);
            return (
              <SvgText
                key={`yl${k}`}
                x={padL - 6}
                y={gy + 3}
                fontSize={9}
                fill={labelColor}
                textAnchor="end"
              >
                {formatY(val)}
              </SvgText>
            );
          })}

          {/* area fills (under non-dashed series with fill) */}
          {series.map((sr, si) => {
            if (!sr.fill || sr.dashed || sr.points.length < 2) return null;
            const p = pts(sr.points);
            const baseY = y(yMin);
            const d = `${smoothPath(p)} L ${p[p.length - 1].x} ${baseY} L ${p[0].x} ${baseY} Z`;
            return <Path key={`f${si}`} d={d} fill={sr.color} fillOpacity={0.12} />;
          })}

          {/* lines */}
          {series.map((sr, si) => {
            const p = pts(sr.points);
            const d = sr.dashed
              ? p.length
                ? `M ${p.map((q) => `${q.x} ${q.y}`).join(" L ")}`
                : ""
              : smoothPath(p);
            return (
              <Path
                key={`l${si}`}
                d={d}
                fill="none"
                stroke={sr.color}
                strokeWidth={2}
                strokeDasharray={sr.dashed ? "5,5" : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}

          {/* over-limit dots on series[0] */}
          {overMask &&
            series[0]?.points.map((v, i) =>
              overMask[i] ? <Circle key={`o${i}`} cx={x(i)} cy={y(v)} r={3} fill={overColor} /> : null,
            )}

          {/* X labels */}
          {xLabels &&
            labelIdxs.map((i) => (
              <SvgText
                key={`xl${i}`}
                x={x(i)}
                y={height - 4}
                fontSize={9}
                fill={labelColor}
                textAnchor="middle"
              >
                {xLabels[i]}
              </SvgText>
            ))}
        </Svg>
      )}
    </View>
  );
}
