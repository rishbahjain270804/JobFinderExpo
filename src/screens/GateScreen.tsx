import React, {useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {colors} from '../theme/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Gate'>;

export default function GateScreen({navigation}: Props) {
  useEffect(() => {
    const fn = async () => {
      navigation.replace('Welcome');
    };
    fn();
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator color={colors.black} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center'},
});