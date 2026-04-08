import React, {useEffect, useMemo, useRef} from 'react';
import {Animated, Text, View, StyleSheet} from 'react-native';

/**
 * Split after . ! ? when preceded by a letter (avoids "1. Foo" breaks).
 * Uses only ASCII space/tab — not \s — so NBSP (\u00A0) in names like "L. Karrass"
 * does not become a sentence boundary (otherwise "Karrass" renders on its own line).
 */
const SENTENCE_AFTER_LETTER = /(?<=[a-zA-Z][.!?])[ \t]+(?=[A-Z"'(])/;

function splitLineIntoSentences(line) {
  if (!line.trim()) return [];
  try {
    return line
      .split(SENTENCE_AFTER_LETTER)
      .map(s => s.trim())
      .filter(Boolean);
  } catch {
    return [line.trim()];
  }
}

/**
 * Split body copy into sentences for spacing + staggered animation.
 * Respects newlines: each line is scanned; multi-sentence lines are split.
 */
export function splitSentences(text) {
  if (!text?.trim()) return [];
  const normalized = text.replace(/\r\n/g, '\n');
  const blocks = normalized.split(/\n\s*\n+/);
  const out = [];

  for (const block of blocks) {
    const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const parts = splitLineIntoSentences(line);
      for (const p of parts) {
        if (p) out.push(p);
      }
    }
  }
  return out;
}

const STAGGER_MS = 52;
const FADE_MS = 360;
const TRANSLATE_Y = 12;
const START_DELAY_MS = 80;

/**
 * Renders body text with a blank line between sentences and fade-up stagger.
 */
export default function FadeUpSentencesText({
  text,
  textStyle,
  animateKey,
  emptyLineHeight,
}) {
  const sentences = useMemo(() => splitSentences(text || ''), [text]);
  const progressRefs = useRef([]);

  const fontSize = textStyle?.fontSize ?? 18;
  const lineHeight =
    textStyle?.lineHeight ?? Math.round(fontSize * 1.45);
  const gap =
    typeof emptyLineHeight === 'number'
      ? emptyLineHeight
      : lineHeight + Math.round(fontSize * 0.35);

  const ensureProgress = n => {
    const arr = progressRefs.current;
    while (arr.length < n) {
      arr.push(new Animated.Value(0));
    }
    if (arr.length > n) {
      arr.length = n;
    }
    return arr.slice(0, n);
  };

  useEffect(() => {
    const n = sentences.length;
    if (n === 0) return undefined;

    const progress = ensureProgress(n);
    progress.forEach(p => p.setValue(0));

    const anims = progress.map(p =>
      Animated.timing(p, {
        toValue: 1,
        duration: FADE_MS,
        useNativeDriver: true,
      }),
    );

    const composite = Animated.sequence([
      Animated.delay(START_DELAY_MS),
      Animated.stagger(STAGGER_MS, anims),
    ]);

    composite.start();
    return () => composite.stop();
  }, [sentences, animateKey]);

  if (!sentences.length) {
    return (
      <Text style={[textStyle, styles.fallback]}>
        {text?.trim() || 'Text to show'}
      </Text>
    );
  }

  const progress = ensureProgress(sentences.length);

  return (
    <View style={styles.wrap}>
      {sentences.map((sentence, i) => {
        const p = progress[i];
        const opacity = p.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        });
        const translateY = p.interpolate({
          inputRange: [0, 1],
          outputRange: [TRANSLATE_Y, 0],
        });
        const isLast = i === sentences.length - 1;

        return (
          <Animated.View
            key={`${animateKey}-s${i}`}
            style={[
              styles.sentenceRow,
              !isLast && {marginBottom: gap},
              {opacity, transform: [{translateY}]},
            ]}>
            <Text style={textStyle}>{sentence}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
  },
  sentenceRow: {
    width: '100%',
    alignItems: 'center',
  },
  fallback: {
    textAlign: 'center',
  },
});
