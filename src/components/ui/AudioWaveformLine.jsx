import React, {useEffect, useState, useRef, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';

/**
 * Minimal horizontal line that undulates while `isPlaying`.
 * Motion is smooth and looped via continuous time — no real FFT (beat feel is simulated).
 */
function buildWavePath(width, height, timeSec, active) {
  const mid = height / 2;
  if (!active || width <= 0) {
    return `M 0 ${mid} L ${Math.max(width, 1)} ${mid}`;
  }
  const segments = 72;
  const t = timeSec * 1.85;
  let d = `M 0 ${mid}`;
  for (let i = 1; i <= segments; i++) {
    const x = (i / segments) * width;
    const u = (i / segments) * Math.PI * 7;
    const wave =
      0.52 * Math.sin(u + t) +
      0.28 * Math.sin(u * 1.55 + t * 1.08) +
      0.2 * Math.sin(u * 2.6 - t * 0.72);
    const beat = 1 + 0.24 * Math.sin(t * 0.62 + u * 0.04);
    const y = mid + wave * beat * (height * 0.46);
    d += ` L ${x} ${y}`;
  }
  return d;
}

export default function AudioWaveformLine({
  isPlaying,
  width,
  height = 44,
  strokeColor = '#2E6C94',
  strokeWidth = 2,
}) {
  const [t, setT] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startRef.current = null;
      setT(0);
      return;
    }
    startRef.current = performance.now();
    const loop = now => {
      if (startRef.current == null) return;
      const sec = (now - startRef.current) / 1000;
      setT(sec);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying]);

  const d = useMemo(
    () => buildWavePath(width, height, t, isPlaying),
    [width, height, t, isPlaying],
  );

  if (width <= 0) {
    return <View style={[styles.holder, {height}]} />;
  }

  return (
    <View style={[styles.wrap, {width, height}]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path
          d={d}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isPlaying ? 0.92 : 0.38}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {overflow: 'hidden'},
  holder: {minWidth: 1},
});
// ConfidenceSpark workspace batch
