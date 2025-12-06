import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import JobsScreen from '../screens/JobsScreen';
import DetailsScreen from '../screens/DetailsScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import PreloadScreen from '../screens/PreloadScreen';
import ManualIntakeScreen from '../screens/ManualIntakeScreen';
import GateScreen from '../screens/GateScreen';
import SavedJobsScreen from '../screens/SavedJobsScreen';
import AppliedJobsScreen from '../screens/AppliedJobsScreen';

export type RootStackParamList = {
  Gate: undefined;
  Welcome: undefined;
  ManualIntake: undefined;
  Preload: undefined;
  Home: undefined;
  Jobs: undefined;
  SavedJobs: undefined;
  AppliedJobs: undefined;
  Details: {jobId: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="Gate">
      <Stack.Screen name="Gate" component={GateScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="ManualIntake" component={ManualIntakeScreen} />
      <Stack.Screen name="Preload" component={PreloadScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Jobs" component={JobsScreen} />
      <Stack.Screen name="SavedJobs" component={SavedJobsScreen} />
      <Stack.Screen name="AppliedJobs" component={AppliedJobsScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}