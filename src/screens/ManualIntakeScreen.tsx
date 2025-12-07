import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  Easing,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Feather} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, {Path, Circle, Defs, LinearGradient, RadialGradient, Stop, G} from 'react-native-svg';
import {RootStackParamList} from '../navigation/AppNavigator';
import {colors} from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ManualIntake'>;

const {width, height} = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Answer {
  [key: string]: string;
}

interface Question {
  id: string;
  text: string;
  placeholder?: string;
  type: 'text' | 'choice' | 'multiline';
  choices?: string[];
  next: (answer: string, allAnswers: Answer) => string | null;
  skipable?: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: 'intro',
    text: "Hi there! 👋 What's your name?",
    placeholder: 'Enter your name',
    type: 'text',
    next: () => 'purpose',
  },
  {
    id: 'purpose',
    text: "Nice to meet you, {name}! What brings you here today?",
    type: 'choice',
    choices: ['Looking for a job', 'Just exploring', 'Career change', 'Upskilling'],
    next: (answer) => {
      if (answer === 'Looking for a job') return 'jobTitle';
      if (answer === 'Just exploring') return 'experience';
      if (answer === 'Career change') return 'currentRole';
      return 'experience';
    },
  },
  {
    id: 'jobTitle',
    text: "Awesome! What role are you seeking?",
    placeholder: 'e.g., Full Stack Developer',
    type: 'text',
    next: () => 'experience',
  },
  {
    id: 'currentRole',
    text: "What do you currently do?",
    placeholder: 'e.g., Marketing Manager',
    type: 'text',
    next: () => 'desiredRole',
  },
  {
    id: 'desiredRole',
    text: "What role would you like to transition into?",
    placeholder: 'e.g., Product Manager',
    type: 'text',
    next: () => 'experience',
  },
  {
    id: 'experience',
    text: "How many years of experience do you have?",
    type: 'choice',
    choices: ['0-2 years', '3-5 years', '6-10 years', '10+ years'],
    next: (answer, all) => {
      if (all.purpose === 'Just exploring') return 'skills';
      return 'location';
    },
  },
  {
    id: 'location',
    text: "Where are you currently located?",
    placeholder: 'City, State',
    type: 'text',
    next: () => 'workMode',
  },
  {
    id: 'workMode',
    text: "What's your preferred work arrangement?",
    type: 'choice',
    choices: ['Remote', 'Hybrid', 'On-site', 'Flexible'],
    next: (answer) => {
      if (answer === 'Remote' || answer === 'Flexible') return 'skills';
      return 'preferredLocation';
    },
  },
  {
    id: 'preferredLocation',
    text: "Where would you like to work?",
    placeholder: 'City, State or Region',
    type: 'text',
    next: () => 'skills',
  },
  {
    id: 'skills',
    text: "What are your top skills? (Tell us what you're great at!)",
    placeholder: 'e.g., JavaScript, React, Leadership',
    type: 'multiline',
    next: (answer, all) => {
      if (all.purpose === 'Just exploring') return 'complete';
      return 'salary';
    },
  },
  {
    id: 'salary',
    text: "What's your expected salary range?",
    placeholder: 'e.g., $100k - $130k',
    type: 'text',
    next: () => 'availability',
  },
  {
    id: 'availability',
    text: "When can you start?",
    type: 'choice',
    choices: ['Immediately', '2 weeks', '1 month', '2-3 months'],
    next: () => 'education',
  },
  {
    id: 'education',
    text: "What's your highest education level?",
    type: 'choice',
    choices: ['High School', 'Bachelor\'s', 'Master\'s', 'PhD', 'Bootcamp/Self-taught'],
    next: () => 'linkedin',
  },
  {
    id: 'linkedin',
    text: "Do you have a LinkedIn profile you'd like to share?",
    placeholder: 'linkedin.com/in/yourprofile (optional)',
    type: 'text',
    skipable: true,
    next: () => 'complete',
  },
  {
    id: 'complete',
    text: "🎉 You're all set, {name}! Let's find your perfect opportunity!",
    type: 'choice',
    choices: ['Start My Journey'],
    next: () => null,
  },
];

export default function ManualIntakeScreen({navigation}: Props) {
  const [currentQuestionId, setCurrentQuestionId] = useState('intro');
  const [answers, setAnswers] = useState<Answer>({});
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>(['intro']);
  const [showIntro, setShowIntro] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const arrowProgress = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({length: 8}, () => new Animated.Value(0))
  ).current;
  const cardRotateAnim = useRef(new Animated.Value(0)).current;
  const inputGlowAnim = useRef(new Animated.Value(0)).current;
  const progressPulse = useRef(new Animated.Value(1)).current;

  const currentQuestion = QUESTIONS.find(q => q.id === currentQuestionId);
  const currentIndex = QUESTIONS.findIndex(q => q.id === currentQuestionId);
  const totalSteps = QUESTIONS.length;
  const progress = history.length / totalSteps;

  useEffect(() => {
    // Glow pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressPulse, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progressPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Particle animations
    particleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 400),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    animateArrowToPosition(history.length - 1);
  }, [history.length]);

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(inputGlowAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(inputGlowAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      inputGlowAnim.stopAnimation();
      inputGlowAnim.setValue(0);
    }
  }, [isTyping]);

  const animateArrowToPosition = (index: number) => {
    Animated.spring(arrowProgress, {
      toValue: index,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const interpolateText = (text: string): string => {
    return text.replace(/\{(\w+)\}/g, (_, key) => answers[key] || '');
  };

  const validateInput = (value: string, questionId: string): string => {
    // Required field validation
    if (!value && !currentQuestion?.skipable) {
      return 'This field is required';
    }

    // Email validation
    if (questionId === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    // Name validation (at least 2 characters)
    if (questionId === 'intro' && value.length < 2) {
      return 'Name must be at least 2 characters';
    }

    // Skills validation (at least 3 characters)
    if (questionId === 'skills' && value.length < 3) {
      return 'Please enter at least one skill';
    }

    // Location validation
    if (questionId === 'location' && value.length < 2) {
      return 'Please enter a valid location';
    }

    return '';
  };

  const handleNext = (choiceAnswer?: string) => {
    const answer = choiceAnswer || inputValue.trim();
    
    // Validate input
    const error = validateInput(answer, currentQuestionId);
    if (error) {
      setErrorMessage(error);
      shakeButton();
      return;
    }

    setErrorMessage('');

    if (!answer && !currentQuestion?.skipable) {
      setErrorMessage('This field is required');
      shakeButton();
      return;
    }

    const nextId = currentQuestion?.next(answer, answers);
    
    if (nextId === 'complete') {
      setAnswers(prev => ({...prev, [currentQuestionId]: answer}));
      setCurrentQuestionId('complete');
      setHistory(prev => [...prev, 'complete']);
      setInputValue('');
      return;
    }

    if (nextId === null || nextId === undefined) {
      handleComplete();
      return;
    }

    setAnswers(prev => ({...prev, [currentQuestionId]: answer}));
    
    animateTransition('forward', () => {
      setCurrentQuestionId(nextId);
      setHistory(prev => [...prev, nextId]);
      setInputValue('');
    });
  };

  const handleBack = () => {
    if (history.length <= 1) return;

    animateTransition('back', () => {
      const newHistory = history.slice(0, -1);
      const prevId = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentQuestionId(prevId);
      setInputValue(answers[prevId] || '');
    });
  };

  const animateTransition = (direction: 'forward' | 'back', callback: () => void) => {
    const toValue = direction === 'forward' ? -width : width;
    const rotateValue = direction === 'forward' ? -5 : 5;

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: toValue * 0.4,
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(cardRotateAnim, {
        toValue: rotateValue,
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(direction === 'forward' ? width * 0.4 : -width * 0.4);
      cardRotateAnim.setValue(0);
      
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 35,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Subtle bounce effect on land
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      });
    });
  };

  const shakeButton = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue: 15, duration: 60, easing: Easing.elastic(2), useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -15, duration: 60, easing: Easing.elastic(2), useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 5, duration: 40, useNativeDriver: true}),
      Animated.spring(shakeAnim, {toValue: 0, friction: 5, tension: 50, useNativeDriver: true}),
    ]).start();
  };

  const handleComplete = async () => {
    try {
      // Clear all old job caches since we have a new user profile
      const {clearAllJobCaches} = require('../services/cacheManager');
      await clearAllJobCaches();
      
      await AsyncStorage.multiSet([
        ['profileManualData', JSON.stringify(answers)],
        ['hasCompletedProfileEntry', 'manual'],
      ]);
      navigation.replace('Preload');
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const startJourney = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowIntro(false);
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    });
  };

  if (showIntro) {
    return (
      <View style={styles.introScreen}>
        <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
          <Defs>
            <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.4" />
              <Stop offset="50%" stopColor="#FFB6C1" stopOpacity="0.2" />
              <Stop offset="100%" stopColor={colors.accent} stopOpacity="0.05" />
            </LinearGradient>
            <LinearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.15" />
              <Stop offset="100%" stopColor={colors.accent} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>
          <Path 
            d={`M0,0 L${width},0 L${width},${height * 0.65} Q${width * 0.5},${height * 0.75} 0,${height * 0.65} Z`} 
            fill="url(#grad1)" 
          />
          <Path 
            d={`M0,${height * 0.35} Q${width * 0.5},${height * 0.25} ${width},${height * 0.35} L${width},${height} L0,${height} Z`} 
            fill="url(#grad2)" 
          />
        </Svg>

        <Animated.View style={[styles.introContent, {opacity: fadeAnim, transform: [{scale: scaleAnim}]}]}>
          <Animated.View style={{transform: [{translateY: bounceAnim}]}}>
            <View style={styles.iconCircle}>
              <Animated.View style={{transform: [{scale: progressPulse}]}}>
                <Feather name="compass" size={48} color={colors.accent} />
              </Animated.View>
            </View>
          </Animated.View>

          <Text style={styles.introTitle}>Let's get to know you...</Text>
          <Text style={styles.introSubtitle}>
            We'll guide you through a personalized journey to find your perfect opportunity. Each question adapts to your unique story.
          </Text>

          <View style={styles.featureList}>
            {[
              {icon: 'zap', text: 'Smart adaptive questions'},
              {icon: 'target', text: 'Personalized experience'},
              {icon: 'clock', text: 'Takes only 2-3 minutes'},
            ].map((feature, i) => (
              <Animated.View 
                key={i}
                style={[
                  styles.featureItem,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    }],
                  },
                ]}
              >
                <View style={styles.featureIcon}>
                  <Feather name={feature.icon as any} size={16} color={colors.accent} />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </Animated.View>
            ))}
          </View>
          
          <Animated.View style={{transform: [{scale: pulseAnim}]}}>
            <Pressable 
              onPress={startJourney} 
              style={({pressed}) => [
                styles.beginButton, 
                pressed && styles.beginButtonPressed
              ]}
            >
              <Text style={styles.beginButtonText}>Begin Your Journey</Text>
              <Animated.View style={{transform: [{translateX: bounceAnim.interpolate({
                inputRange: [-10, 0],
                outputRange: [0, 5],
              })}]}}>
                <Feather name="arrow-right" size={22} color={colors.bg} />
              </Animated.View>
            </Pressable>
          </Animated.View>

          <Text style={styles.skipText}>Takes less than 3 minutes • Can save & return anytime</Text>
        </Animated.View>

        <View style={styles.floatingParticles}>
          {particleAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  left: `${10 + (i * 12)}%`,
                  top: `${15 + ((i % 4) * 20)}%`,
                  opacity: anim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.1, 0.4, 0.1],
                  }),
                  transform: [{
                    scale: anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1.2, 0.5],
                    }),
                  }, {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -30],
                    }),
                  }],
                },
              ]}
            />
          ))}
        </View>
      </View>
    );
  }

  if (currentQuestionId === 'complete') {
    return (
      <View style={styles.introScreen}>
        <Animated.View style={[styles.introContent, {opacity: fadeAnim, transform: [{scale: scaleAnim}]}]}>
          <Animated.View style={{transform: [{scale: pulseAnim}]}}>
            <View style={styles.completionIcon}>
              <Feather name="check-circle" size={64} color={colors.accent} />
            </View>
          </Animated.View>
          
          <Text style={styles.completionTitle}>All Set! 🎉</Text>
          <Text style={styles.completionText}>
            We've got everything we need. Let's find you the perfect opportunities!
          </Text>

          <Pressable 
            onPress={handleComplete}
            style={({pressed}) => [
              styles.beginButton,
              pressed && styles.beginButtonPressed,
            ]}
          >
            <Text style={styles.beginButtonText}>View My Matches</Text>
            <Feather name="arrow-right" size={22} color={colors.bg} />
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  if (!currentQuestion) return null;

  return (
    <KeyboardAvoidingView 
      style={{flex: 1}} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.backgroundDecorations}>
        {particleAnims.slice(0, 4).map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bgParticle,
              {
                left: `${20 + (i * 20)}%`,
                top: `${10 + (i * 15)}%`,
                opacity: anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.03, 0.08, 0.03],
                }),
                transform: [{
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                }],
              },
            ]}
          />
        ))}
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <View style={styles.progressLabelRow}>
            <Animated.View style={{transform: [{scale: progressPulse}]}}>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>
                  {history.length}/{totalSteps}
                </Text>
              </View>
            </Animated.View>
            <Text style={styles.progressText}>
              {progress === 1 ? '🎉 Almost done!' : `Step ${history.length} of ${totalSteps}`}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                {
                  width: `${progress * 100}%`,
                  transform: [{scaleY: progressPulse}],
                }
              ]} 
            />
          </View>
          <Text style={styles.progressSubtext}>
            {Math.round(progress * 100)}% complete • {Math.max(0, totalSteps - history.length)} questions left
          </Text>
        </View>

        <Svg width={width - 48} height={60} style={styles.flowArrow}>
          <Defs>
            <LinearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.5" />
              <Stop offset="100%" stopColor={colors.accent} stopOpacity="1" />
            </LinearGradient>
            <RadialGradient id="nodeGlow" cx="50%" cy="50%">
              <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.8" />
              <Stop offset="50%" stopColor={colors.accent} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          
          <Path
            d={`M 20 30 Q ${(width - 48) * 0.5} 10, ${width - 68} 30`}
            stroke="url(#arrowGrad)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8,4"
          />
          
          {QUESTIONS.map((_, index) => {
            const x = 20 + ((width - 88) / (totalSteps - 1)) * index;
            const isCompleted = index < history.length - 1;
            const isCurrent = index === history.length - 1;
            
            return (
              <G key={index}>
                {isCurrent && (
                  <AnimatedCircle
                    cx={x}
                    cy={30}
                    r={glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 14],
                    })}
                    fill="url(#nodeGlow)"
                  />
                )}
                <Circle
                  cx={x}
                  cy={30}
                  r={isCurrent ? 6 : 4}
                  fill={isCompleted ? colors.accent : isCurrent ? colors.accent : '#d0d0d0'}
                  opacity={isCurrent ? 1 : isCompleted ? 1 : 0.4}
                />
              </G>
            );
          })}

          <Animated.View
            style={{
              position: 'absolute',
              left: 20,
              top: 20,
              transform: [{
                translateX: arrowProgress.interpolate({
                  inputRange: [0, totalSteps - 1],
                  outputRange: [0, width - 88],
                }),
              }],
            }}
          >
            <Feather name="arrow-right" size={20} color={colors.accent} />
          </Animated.View>
        </Svg>
      </View>

      <Animated.View
        style={[
          styles.questionCard,
          {
            opacity: fadeAnim,
            transform: [
              {translateX: slideAnim},
              {scale: scaleAnim},
              {
                rotateY: cardRotateAnim.interpolate({
                  inputRange: [-5, 5],
                  outputRange: ['-5deg', '5deg'],
                }),
              },
              {scale: pulseAnim},
            ],
          },
        ]}
      >
        <Animated.View style={{
          transform: [{
            scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            }),
          }],
        }}>
          {currentQuestion.type === 'choice' && (
            <Text style={styles.questionEmoji}>🎯</Text>
          )}
          {currentQuestion.type === 'text' && (
            <Text style={styles.questionEmoji}>✨</Text>
          )}
          {currentQuestion.type === 'multiline' && (
            <Text style={styles.questionEmoji}>📝</Text>
          )}
          <Text style={styles.questionText}>
            {interpolateText(currentQuestion.text)}
            {!currentQuestion.skipable && currentQuestion.type !== 'choice' && (
              <Text style={styles.requiredIndicator}> *</Text>
            )}
          </Text>
        </Animated.View>

        {currentQuestion.type === 'text' && (
          <View>
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  shadowOpacity: inputGlowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.08, 0.2],
                  }),
                },
              ]}
            >
              <Animated.View style={{
                borderRadius: 20,
                borderWidth: 2,
                borderColor: inputGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['rgba(240, 240, 240, 1)', 'rgba(220, 129, 129, 0.5)'],
                }),
              }}>
                <TextInput
                  style={[styles.input, {borderWidth: 0}]}
                  value={inputValue}
                  onChangeText={(text) => {
                    setInputValue(text);
                    setIsTyping(text.length > 0);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={currentQuestion.placeholder}
                  placeholderTextColor="#aaa"
                  autoFocus
                  onSubmitEditing={() => handleNext()}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                />
              </Animated.View>
            </Animated.View>
            {errorMessage ? (
              <Animated.View style={[styles.errorContainer, {opacity: fadeAnim}]}>
                <Feather name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </Animated.View>
            ) : (
              inputValue.length > 0 && (
                <Animated.View style={[styles.characterCount, {opacity: fadeAnim}]}>
                  <Text style={styles.characterCountText}>{inputValue.length} characters</Text>
                </Animated.View>
              )
            )}
          </View>
        )}

        {currentQuestion.type === 'multiline' && (
          <View>
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  shadowOpacity: inputGlowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.08, 0.2],
                  }),
                },
              ]}
            >
              <Animated.View style={{
                borderRadius: 20,
                borderWidth: 2,
                borderColor: inputGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['rgba(240, 240, 240, 1)', 'rgba(220, 129, 129, 0.5)'],
                }),
              }}>
                <TextInput
                  style={[styles.input, styles.inputMultiline, {borderWidth: 0}]}
                  value={inputValue}
                  onChangeText={(text) => {
                    setInputValue(text);
                    setIsTyping(text.length > 0);
                  }}
                  placeholder={currentQuestion.placeholder}
                  placeholderTextColor="#aaa"
                  multiline
                  numberOfLines={4}
                  autoFocus
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                />
              </Animated.View>
            </Animated.View>
            {inputValue.length > 0 && (
              <Animated.View style={[styles.characterCount, {opacity: fadeAnim}]}>
                <Text style={styles.characterCountText}>{inputValue.length} characters</Text>
              </Animated.View>
            )}
            <Text style={styles.hint}>💡 Tip: List your strongest skills first</Text>
          </View>
        )}

        {currentQuestion.type === 'choice' && (
          <View style={styles.choicesContainer}>
            {currentQuestion.choices?.map((choice, index) => {
              const delay = index * 80;
              return (
                <Animated.View
                  key={index}
                  style={{
                    opacity: fadeAnim,
                    transform: [{
                      translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    }],
                  }}
                >
                  <Pressable
                    onPress={() => handleNext(choice)}
                    style={({pressed}) => [
                      styles.choiceButton,
                      pressed && styles.choiceButtonPressed,
                    ]}
                  >
                    <View style={styles.choiceContent}>
                      <View style={styles.choiceIconCircle}>
                        <Text style={styles.choiceNumber}>{index + 1}</Text>
                      </View>
                      <Text style={styles.choiceText}>{choice}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={colors.accent} />
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        )}
      </Animated.View>

      <View style={styles.navigation}>
        {history.length > 1 && currentQuestionId !== 'complete' && (
          <Pressable
            onPress={handleBack}
            style={({pressed}) => [
              styles.navButton, 
              styles.backButton, 
              pressed && {opacity: 0.6, transform: [{scale: 0.96}]},
            ]}
          >
            <Animated.View style={{
              transform: [{
                translateX: bounceAnim.interpolate({
                  inputRange: [-10, 0],
                  outputRange: [-3, 0],
                }),
              }],
            }}>
              <Feather name="arrow-left" size={20} color={colors.text} />
            </Animated.View>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        )}

        {currentQuestion.type !== 'choice' && currentQuestionId !== 'complete' && (
          <Animated.View style={{transform: [{translateX: shakeAnim}], flex: 1}}>
            <Pressable
              onPress={() => handleNext()}
              style={({pressed}) => [
                styles.navButton,
                styles.nextButton,
                pressed && {transform: [{scale: 0.96}]},
              ]}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestion.skipable && !inputValue ? 'Skip' : 'Next'}
              </Text>
              <Animated.View style={{
                transform: [{
                  translateX: bounceAnim.interpolate({
                    inputRange: [-10, 0],
                    outputRange: [0, 3],
                  }),
                }],
              }}>
                <Feather name="arrow-right" size={20} color={colors.bg} />
              </Animated.View>
            </Pressable>
          </Animated.View>
        )}
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  introScreen: {
    flex: 1,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  introContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 24,
  },
  introTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: -0.5,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 8},
    elevation: 8,
    borderWidth: 3,
    borderColor: '#ffecec',
  },
  featureList: {
    gap: 12,
    alignSelf: 'stretch',
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffecec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  beginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.accent,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 999,
    marginTop: 32,
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 8,
  },
  beginButtonPressed: {
    transform: [{scale: 0.96}],
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  beginButtonText: {
    color: colors.bg,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  skipText: {
    fontSize: 13,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  floatingParticles: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    opacity: 0.3,
  },
  screen: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  progressSection: {
    marginTop: Platform.OS === 'ios' ? 50 : 30,
    marginBottom: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  progressHeader: {
    marginBottom: 20,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  progressBadgeText: {
    fontSize: 12,
    color: colors.bg,
    fontWeight: '700',
  },
  progressText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 999,
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  flowArrow: {
    marginTop: 12,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 36,
    marginHorizontal: 24,
    marginBottom: 20,
    minHeight: 320,
    shadowColor: '#DC8181',
    shadowOpacity: 0.15,
    shadowRadius: 28,
    shadowOffset: {width: 0, height: 12},
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(220, 129, 129, 0.06)',
  },
  questionEmoji: {
    fontSize: 32,
    marginBottom: 12,
    lineHeight: 40,
  },
  questionText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  inputContainer: {
    shadowColor: colors.accent,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    minHeight: 56,
  },
  inputMultiline: {
    minHeight: 160,
    maxHeight: 220,
    textAlignVertical: 'top',
    paddingTop: 18,
    lineHeight: 24,
  },
  characterCount: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginRight: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  characterCountText: {
    fontSize: 10,
    color: colors.bg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
    paddingLeft: 4,
    lineHeight: 20,
  },
  choicesContainer: {
    gap: 12,
    marginTop: 4,
  },
  choiceButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#DC8181',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  choiceButtonPressed: {
    backgroundColor: '#fef5f5',
    borderColor: colors.accent,
    transform: [{scale: 0.97}],
    shadowOpacity: 0.18,
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  choiceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(220, 129, 129, 0.2)',
  },
  choiceNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.accent,
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 999,
  },
  backButton: {
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.2,
  },
  nextButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 36,
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bg,
    letterSpacing: 0.3,
  },
  completionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fef5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(220, 129, 129, 0.2)',
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  completionTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  completionText: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  backgroundDecorations: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '500',
    flex: 1,
  },
  requiredIndicator: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: '700',
  },
  bgParticle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
  },
});
