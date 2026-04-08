import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
  RadialGradient,
} from 'react-native-svg';

function pointOnRoundedRectPerimeter(t, w, h, r0) {
  'worklet';
  const r = Math.min(r0, w / 2, h / 2);
  const arc = (Math.PI / 2) * r;
  const top = w - 2 * r;
  const side = h - 2 * r;
  const lens = [top, arc, side, arc, top, arc, side, arc];
  let total = 0;
  for (let i = 0; i < 8; i++) {
    total += lens[i];
  }
  let s = (t % 1) * total;
  if (s < 0) {
    s += total;
  }

  for (let seg = 0; seg < 8; seg++) {
    const len = lens[seg];
    if (s > len) {
      s -= len;
      continue;
    }
    if (seg === 0) {
      return {x: r + s, y: 0, tx: 1, ty: 0};
    }
    if (seg === 1) {
      const th = -Math.PI / 2 + s / r;
      const cx = w - r;
      const cy = r;
      return {
        x: cx + r * Math.cos(th),
        y: cy + r * Math.sin(th),
        tx: -Math.sin(th),
        ty: Math.cos(th),
      };
    }
    if (seg === 2) {
      return {x: w, y: r + s, tx: 0, ty: 1};
    }
    if (seg === 3) {
      const th = s / r;
      const cx = w - r;
      const cy = h - r;
      return {
        x: cx + r * Math.cos(th),
        y: cy + r * Math.sin(th),
        tx: -Math.sin(th),
        ty: Math.cos(th),
      };
    }
    if (seg === 4) {
      return {x: w - r - s, y: h, tx: -1, ty: 0};
    }
    if (seg === 5) {
      const th = Math.PI / 2 + s / r;
      const cx = r;
      const cy = h - r;
      return {
        x: cx + r * Math.cos(th),
        y: cy + r * Math.sin(th),
        tx: -Math.sin(th),
        ty: Math.cos(th),
      };
    }
    if (seg === 6) {
      return {x: 0, y: h - r - s, tx: 0, ty: -1};
    }
    {
      const th = Math.PI + s / r;
      const cx = r;
      const cy = r;
      return {
        x: cx + r * Math.cos(th),
        y: cy + r * Math.sin(th),
        tx: -Math.sin(th),
        ty: Math.cos(th),
      };
    }
  }
  return {x: r, y: 0, tx: 1, ty: 0};
}

function rotationDegFromTangent(tx, ty) {
  'worklet';
  return (Math.atan2(ty, tx) * 180) / Math.PI;
}

function fourPointStarPath(outer, inner) {
  const o = outer;
  const i = inner;
  return (
    `M 0 ${-o} L ${i} ${-i} L ${o} 0 L ${i} ${i} L 0 ${o} L ${-i} ${i} L ${-o} 0 L ${-i} ${-i} Z`
  );
}

/**
 * Wraps a hero image with two comets that orbit clockwise along its rounded border.
 *
 * Uses Animated.View for motion (not Animated SVG G) for stable Android builds.
 *
 * @param {number} cometSize — scale of the 4-point star head
 * @param {string} color — star, tail, and glow tint
 * @param {number} orbitDurationMs — milliseconds for one full lap (smaller = faster)
 * @param {number} speed — factor on top of duration (2 = twice as fast)
 */
export default function HeroCometBorder({
  children,
  width,
  height,
  borderRadius = 12,
  cometSize = 14,
  color = '#A5D4ED',
  orbitDurationMs = 10000,
  speed = 1,
  style,
}) {
  const progress = useSharedValue(0);
  const w = width;
  const h = height;
  const r = borderRadius;

  const headScale = 0.6;
  const outer = cometSize * 0.2 * headScale;
  const inner = outer * 0.38;
  const tailHalfH = cometSize * 0.45 * headScale;
  const tailLen = cometSize * 6.75;
  const starPath = fourPointStarPath(outer, inner);
  const canvas = Math.ceil(
    Math.max(cometSize * 10, tailLen + outer * 2 + 24),
  );
  const half = canvas / 2;

  const x0 = half - tailLen;
  const x1 = half;
  const ym = half;
  const pin = tailHalfH * 0.35;
  // Wide at star (x1), tapers to narrow tip at back (x0); gradient still strong → star, fade → tip
  const tailPath = `M ${x0} ${ym - pin} L ${x1} ${ym - tailHalfH} L ${x1} ${ym + tailHalfH} L ${x0} ${ym + pin} Z`;

  useEffect(() => {
    const dur = Math.max(1200, orbitDurationMs / Math.max(0.25, speed));
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, {duration: dur, easing: Easing.linear}),
      -1,
      false,
    );
  }, [orbitDurationMs, speed, progress]);

  const comet1Style = useAnimatedStyle(() => {
    const {x, y, tx, ty} = pointOnRoundedRectPerimeter(progress.value, w, h, r);
    const deg = rotationDegFromTangent(tx, ty);
    return {
      position: 'absolute',
      left: x - half,
      top: y - half,
      width: canvas,
      height: canvas,
      transform: [{rotate: `${deg}deg`}],
    };
  });

  const comet2Style = useAnimatedStyle(() => {
    const {x, y, tx, ty} = pointOnRoundedRectPerimeter(
      progress.value + 0.5,
      w,
      h,
      r,
    );
    const deg = rotationDegFromTangent(tx, ty);
    return {
      position: 'absolute',
      left: x - half,
      top: y - half,
      width: canvas,
      height: canvas,
      transform: [{rotate: `${deg}deg`}],
    };
  });

  const gid1 = 'hero-comet-tail-a';
  const gid2 = 'hero-comet-tail-b';
  const glow1 = 'hero-comet-glow-a';
  const glow2 = 'hero-comet-glow-b';

  return (
    <View
      style={[styles.wrap, {width: w, height: h, borderRadius: r}, style]}>
      <View
        style={[styles.clip, styles.clipInner, {width: w, height: h, borderRadius: r}]}>
        {children}
      </View>
      <View
        style={[StyleSheet.absoluteFill, styles.overlay, {borderRadius: r}]}
        pointerEvents="none"
        collapsable={false}>
        <Animated.View style={comet1Style}>
          <CometSvg
            canvas={canvas}
            half={half}
            tailPath={tailPath}
            starPath={starPath}
            outer={outer}
            cometSize={cometSize}
            color={color}
            tailGradId={gid1}
            glowId={glow1}
          />
        </Animated.View>
        <Animated.View style={comet2Style}>
          <CometSvg
            canvas={canvas}
            half={half}
            tailPath={tailPath}
            starPath={starPath}
            outer={outer}
            cometSize={cometSize}
            color={color}
            tailGradId={gid2}
            glowId={glow2}
          />
        </Animated.View>
      </View>
    </View>
  );
}

function CometSvg({
  canvas,
  half,
  tailPath,
  starPath,
  outer,
  cometSize,
  color,
  tailGradId,
  glowId,
}) {
  return (
    <Svg width={canvas} height={canvas}>
      <Defs>
        <LinearGradient id={tailGradId} x1="1" y1="0" x2="0" y2="0">
          <Stop offset="0" stopColor={color} stopOpacity="0.98" />
          <Stop offset="0.28" stopColor={color} stopOpacity="0.5" />
          <Stop offset="0.65" stopColor={color} stopOpacity="0.12" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
        <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity="0.65" />
          <Stop offset="0.5" stopColor={color} stopOpacity="0.22" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Path d={tailPath} fill={`url(#${tailGradId})`} />
      <Circle
        cx={half}
        cy={half}
        r={Math.max(outer * 2.2, cometSize * 0.22)}
        fill={`url(#${glowId})`}
      />
      <G transform={`translate(${half} ${half})`}>
        <Path
          d={starPath}
          fill="none"
          stroke={color}
          strokeWidth={outer * 0.42}
          strokeOpacity={0.45}
          strokeLinejoin="round"
        />
        <Path d={starPath} fill={color} />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  clip: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  clipInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    overflow: 'hidden',
  },
});
