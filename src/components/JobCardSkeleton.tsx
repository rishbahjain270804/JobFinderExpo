import React from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {colors} from '../theme/colors';

interface JobCardSkeletonProps {
  animate?: boolean;
}

export default function JobCardSkeleton({animate = true}: JobCardSkeletonProps) {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animate) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animate]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      {/* Match Score Badge */}
      <Animated.View style={[styles.badge, {opacity: shimmerOpacity}]} />

      {/* Company & Role */}
      <Animated.View style={[styles.titleLine, {opacity: shimmerOpacity}]} />
      <Animated.View style={[styles.subtitleLine, {opacity: shimmerOpacity, width: '70%'}]} />

      {/* Details */}
      <View style={styles.details}>
        <Animated.View style={[styles.detailChip, {opacity: shimmerOpacity}]} />
        <Animated.View style={[styles.detailChip, {opacity: shimmerOpacity}]} />
        <Animated.View style={[styles.detailChip, {opacity: shimmerOpacity, width: 60}]} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Animated.View style={[styles.footerLine, {opacity: shimmerOpacity, width: 80}]} />
        <Animated.View style={[styles.iconCircle, {opacity: shimmerOpacity}]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  badge: {
    width: 60,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  titleLine: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  subtitleLine: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
  },
  details: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  detailChip: {
    height: 28,
    width: 70,
    backgroundColor: '#e0e0e0',
    borderRadius: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerLine: {
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
});
