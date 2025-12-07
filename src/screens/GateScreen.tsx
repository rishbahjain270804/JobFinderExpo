import React, {useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {colors} from '../theme/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Gate'>;

export default function GateScreen({navigation}: Props) {
  useEffect(() => {
    const checkProfileAndNavigate = async () => {
      try {
        // Check if user has completed profile
        const hasCompletedProfile = await AsyncStorage.getItem('hasCompletedProfileEntry');
        const profileData = await AsyncStorage.getItem('profileManualData');
        
        if (hasCompletedProfile === 'manual' && profileData) {
          // Returning user - skip onboarding, go straight to home
          navigation.replace('Home');
        } else {
          // New user - start onboarding flow
          navigation.replace('Welcome');
        }
      } catch (error) {
        console.error('Failed to check profile:', error);
        // On error, default to Welcome screen
        navigation.replace('Welcome');
      }
    };
    
    checkProfileAndNavigate();
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center'},
});