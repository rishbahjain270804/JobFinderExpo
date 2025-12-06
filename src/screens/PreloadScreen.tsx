import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, Animated, Text, Dimensions} from 'react-native';
import {colors} from '../theme/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Feather} from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Preload'>;

const {width} = Dimensions.get('window');

const PROCESSING_STEPS = [
  {id: 1, label: 'Analyzing your profile', icon: 'user', duration: 1200},
  {id: 2, label: 'Matching skills & experience', icon: 'star', duration: 1500},
  {id: 3, label: 'Finding opportunities', icon: 'search', duration: 1800},
  {id: 4, label: 'Ranking best matches', icon: 'trending-up', duration: 1400},
  {id: 5, label: 'Preparing results', icon: 'check-circle', duration: 1000},
];

export default function PreloadScreen({navigation}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<any>(null);
  
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const stepFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProfileData();
    
    // Initial animations
    Animated.parallel([
      Animated.timing(opacity, {toValue: 1, duration: 600, useNativeDriver: true}),
      Animated.spring(scale, {toValue: 1, friction: 8, tension: 40, useNativeDriver: true}),
    ]).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {toValue: 1.08, duration: 800, useNativeDriver: true}),
        Animated.timing(pulseAnim, {toValue: 1, duration: 800, useNativeDriver: true}),
      ])
    ).start();
  }, []);

  const loadProfileData = async () => {
    try {
      const data = await AsyncStorage.getItem('profileManualData');
      if (data) {
        setProfileData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

  useEffect(() => {
    if (currentStep < PROCESSING_STEPS.length) {
      // Fade in step
      stepFadeAnim.setValue(0);
      Animated.timing(stepFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Progress bar
      Animated.timing(progressAnim, {
        toValue: (currentStep + 1) / PROCESSING_STEPS.length,
        duration: PROCESSING_STEPS[currentStep].duration,
        useNativeDriver: false,
      }).start();

      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, PROCESSING_STEPS[currentStep].duration);

      return () => clearTimeout(timer);
    } else {
      // All steps complete - navigate
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {toValue: 0, duration: 400, useNativeDriver: true}),
          Animated.timing(scale, {toValue: 0.9, duration: 400, useNativeDriver: true}),
        ]).start(() => {
          navigation.replace('Home');
        });
      }, 500);
    }
  }, [currentStep]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.container, {opacity, transform: [{scale}]}]}>
        {/* Icon with pulse */}
        <Animated.View style={{transform: [{scale: pulseAnim}]}}>
          <View style={styles.iconContainer}>
            <Feather 
              name={currentStep < PROCESSING_STEPS.length ? PROCESSING_STEPS[currentStep].icon as any : 'check-circle'} 
              size={48} 
              color={colors.accent} 
            />
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Finding Your Perfect Match</Text>
        
        {/* Current step */}
        {currentStep < PROCESSING_STEPS.length && (
          <Animated.View style={{opacity: stepFadeAnim}}>
            <Text style={styles.stepText}>{PROCESSING_STEPS[currentStep].label}</Text>
          </Animated.View>
        )}

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                {width: progressWidth}
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((currentStep / PROCESSING_STEPS.length) * 100)}%
          </Text>
        </View>

        {/* Profile preview */}
        {profileData && (
          <View style={styles.profilePreview}>
            <Text style={styles.profileText}>
              👤 {profileData.name || 'User'}
            </Text>
            <Text style={styles.profileSubtext}>
              {profileData.currentRole || 'Professional'} • {profileData.experience || 'Experienced'}
            </Text>
          </View>
        )}

        {/* Steps indicator */}
        <View style={styles.stepsIndicator}>
          {PROCESSING_STEPS.map((step, index) => (
            <View 
              key={step.id}
              style={[
                styles.stepDot,
                index < currentStep && styles.stepDotComplete,
                index === currentStep && styles.stepDotActive,
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fef5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 3,
    borderColor: 'rgba(220, 129, 129, 0.2)',
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  stepText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 999,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  profilePreview: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 129, 129, 0.1)',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  profileSubtext: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  stepsIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  stepDotActive: {
    backgroundColor: colors.accent,
    width: 24,
  },
  stepDotComplete: {
    backgroundColor: colors.accent,
    opacity: 0.5,
  },
});