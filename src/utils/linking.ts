import {LinkingOptions} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix, 'jspcoders://', 'https://jspcoders.tech', 'https://www.jspcoders.tech'],
  config: {
    screens: {
      Gate: '',
      Welcome: 'welcome',
      ManualIntake: 'onboarding',
      Preload: 'loading',
      Home: 'home',
      Jobs: 'jobs',
      SavedJobs: 'saved',
      AppliedJobs: 'applied',
      Details: {
        path: 'job/:jobId',
        parse: {
          jobId: (jobId: string) => jobId,
        },
      },
    },
  },
};
