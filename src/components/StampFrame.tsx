import { useMemo } from 'react';
import Svg, { ClipPath, Defs, Image as SvgImage, Path } from 'react-native-svg';

import { Colors } from '@/constants/colors';

let clipIdSeq = 0;

interface StampFrameProps {
  width: number;
  height: number;
  /** 채워진 우표의 사진 URI. 없으면 빈 칸으로 렌더링 */
  imageUri?: string;
  /** 빈 칸 배경색 */
  fillColor?: string;
  /** 톱니 반지름. 기본값은 크기에 비례 (그리드~상세 뷰 모두 뭉개지지 않게 클램프) */
  notchRadius?: number;
}

/**
 * 톱니(perforation) 우표 프레임 — 앱의 핵심 정체성 컴포넌트.
 * 사각형 둘레를 시계방향으로 돌며 일정 간격으로 반원을 안쪽으로 파낸
 * SVG Path를 생성하고, 같은 path를 ClipPath로 사용해 사진을 마스킹한다.
 * 빈 칸과 채워진 칸 모두 이 컴포넌트 하나로 처리한다.
 */
export function StampFrame({ width, height, imageUri, fillColor = Colors.stampEmpty, notchRadius }: StampFrameProps) {
  const r = notchRadius ?? clamp(Math.min(width, height) / 16, 2, 12);

  const path = useMemo(() => buildStampPath(width, height, r), [width, height, r]);
  const clipId = useMemo(() => `stamp-clip-${clipIdSeq++}`, []);

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <ClipPath id={clipId}>
          <Path d={path} />
        </ClipPath>
      </Defs>
      <Path d={path} fill={fillColor} />
      {imageUri ? (
        <SvgImage
          href={{ uri: imageUri }}
          x={0}
          y={0}
          width={width}
          height={height}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : null}
    </Svg>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 한 변 위 톱니 중심 위치들. 반지름의 4배 간격을 목표로 균등 분배 */
function notchCenters(edgeLength: number, r: number): number[] {
  const desiredSpacing = r * 4;
  const count = Math.max(2, Math.round(edgeLength / desiredSpacing));
  const spacing = edgeLength / count;
  return Array.from({ length: count }, (_, i) => (i + 0.5) * spacing);
}

/**
 * (0,0)→(w,0)→(w,h)→(0,h) 시계방향으로 돌며 각 변에 안쪽으로 파인
 * 반원 아치(sweep=0)를 삽입한 닫힌 path를 만든다.
 */
function buildStampPath(w: number, h: number, r: number): string {
  const parts: string[] = ['M 0 0'];

  for (const c of notchCenters(w, r)) {
    parts.push(`L ${f(c - r)} 0`, `A ${f(r)} ${f(r)} 0 0 0 ${f(c + r)} 0`);
  }
  parts.push(`L ${f(w)} 0`);

  for (const c of notchCenters(h, r)) {
    parts.push(`L ${f(w)} ${f(c - r)}`, `A ${f(r)} ${f(r)} 0 0 0 ${f(w)} ${f(c + r)}`);
  }
  parts.push(`L ${f(w)} ${f(h)}`);

  for (const c of notchCenters(w, r)) {
    const x = w - c;
    parts.push(`L ${f(x + r)} ${f(h)}`, `A ${f(r)} ${f(r)} 0 0 0 ${f(x - r)} ${f(h)}`);
  }
  parts.push(`L 0 ${f(h)}`);

  for (const c of notchCenters(h, r)) {
    const y = h - c;
    parts.push(`L 0 ${f(y + r)}`, `A ${f(r)} ${f(r)} 0 0 0 0 ${f(y - r)}`);
  }
  parts.push('Z');

  return parts.join(' ');
}

function f(n: number): string {
  return Number(n.toFixed(2)).toString();
}
