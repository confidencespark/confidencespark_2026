import React from 'react';
import { StyleSheet, View } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
/**
 * A cached, progressive background image that renders children like ImageBackground.
 * - Uses FastImage cache.
 * - Shows a tiny blurred placeholder first (if your CDN supports query params).
 *
 * Props:
 *  - uri: string (remote URL)
 *  - style: ViewStyle (container, should define size)
 *  - imageStyle: ImageStyle (applied to underlying images, e.g., borderRadius)
 *  - tinyQuery: string (query params for tiny blurred image)
 *  - priority: 'low' | 'normal' | 'high'
 *  - cache: 'immutable' | 'web' | 'cacheOnly'
 */
export default function ProgressiveHeroBg({
  uri,
  style,
  imageStyle,
  children,
  tinyQuery = '?w=24&blur=50',
  priority = 'high',
  cache = 'web',
}) {
  const sourceFull = uri
    ? {
        uri,
        priority: FastImage.priority[priority] || FastImage.priority.high,
        cache: FastImage.cacheControl[cache] || FastImage.cacheControl.web,
      }
    : undefined;

  const sourceTiny = uri
    ? {
        uri: `${uri}${tinyQuery || ''}`,
        priority: FastImage.priority[priority] || FastImage.priority.high,
      }
    : undefined;

  return (
    <View style={style}>
      {/* tiny placeholder (underneath) */}
      {sourceTiny && (
        <FastImage
          style={StyleSheet.absoluteFill}
          imageStyle={imageStyle}
          source={sourceTiny}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}

      {/* full image (on top) */}
      {sourceFull && (
        <FastImage
          style={StyleSheet.absoluteFill}
          imageStyle={imageStyle}
          source={sourceFull}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}

      {children}
    </View>
  );
}
