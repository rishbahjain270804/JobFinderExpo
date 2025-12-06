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
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.sub}>Lorem ipsum dolor sit amet consectetur. Lorem id sit</Text>
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Continue</Text>
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
  top: {backgroundColor: colors.accent, flex: 0.6, alignItems: 'center', justifyContent: 'center'},
  content: {padding: 24, gap: 12, flex: 0.4},
  title: {color: colors.text, fontSize: 32, fontWeight: '800'},
  sub: {color: '#777', fontSize: 14},
  footerRow: {marginTop: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  footerText: {color: '#777', fontSize: 14},
  circle: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
});