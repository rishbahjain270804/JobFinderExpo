import 'react-native-gesture-handler';
import React from 'react';
import {StatusBar, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import {colors} from './src/theme/colors';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={{flex: 1, backgroundColor: colors.bg}}>
        <AppNavigator />
      </View>
    </NavigationContainer>
  );
}
