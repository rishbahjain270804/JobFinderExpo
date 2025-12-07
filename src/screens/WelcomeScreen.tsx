import React from 'react';
import {View, Text, StyleSheet, Pressable, Dimensions} from 'react-native';
import {colors} from '../theme/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, {Path} from 'react-native-svg';
import {Feather} from '@expo/vector-icons';
import Topography from '../components/Topography';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({navigation}: Props) {
  const onContinue = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWelcome', '1');
    } catch {}
    navigation.replace('ManualIntake');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Topography />
        <Svg
          style={{position: 'absolute', bottom: -1}}
          width={Dimensions.get('window').width}
          height={60}
          viewBox={`0 0 ${Dimensions.get('window').width} 60`}
        >
          <Path d={`M0 0 Q ${Dimensions.get('window').width * 0.5} 60 ${Dimensions.get('window').width} 0 V 60 H 0 Z`} fill={colors.bg} />
        </Svg>
      </View>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="briefcase" size={48} color={colors.accent} />
        </View>
        <Text style={styles.title}>Find Your Dream Job</Text>
        <Text style={styles.sub}>
          Discover personalized job matches tailored to your skills, experience, and career goals. 
          Let's get started on your journey to success!
        </Text>
        
        <View style={styles.features}>
          <View style={styles.feature}>
            <Feather name="check-circle" size={20} color={colors.accent} />
            <Text style={styles.featureText}>Smart job matching</Text>
          </View>
          <View style={styles.feature}>
            <Feather name="check-circle" size={20} color={colors.accent} />
            <Text style={styles.featureText}>Real-time opportunities</Text>
          </View>
          <View style={styles.feature}>
            <Feather name="check-circle" size={20} color={colors.accent} />
            <Text style={styles.featureText}>Track applications</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Get Started</Text>
          <Pressable
            onPress={onContinue}
            style={({pressed}) => [styles.circle, {backgroundColor: pressed ? '#e08a8a' : colors.accent}]}
          >
            <Feather name="arrow-right" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg},
  top: {backgroundColor: colors.accent, flex: 0.5, alignItems: 'center', justifyContent: 'center'},
  content: {padding: 24, gap: 16, flex: 0.5, justifyContent: 'space-between'},
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {color: colors.text, fontSize: 28, fontWeight: '800', textAlign: 'center'},
  sub: {color: '#666', fontSize: 15, lineHeight: 22, textAlign: 'center', paddingHorizontal: 8},
  features: {gap: 12, marginTop: 8},
  feature: {flexDirection: 'row', alignItems: 'center', gap: 12},
  featureText: {fontSize: 15, color: '#444', fontWeight: '500'},
  footerRow: {marginTop: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  footerText: {color: '#777', fontSize: 14, fontWeight: '600'},
  circle: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
});