import React, {useMemo} from 'react';
import {View, Text, StyleSheet, FlatList, Pressable} from 'react-native';
import Header from '../components/Header';
import {colors} from '../theme/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Jobs'>;

const data = [
  {id: '1', title: 'Frontend Engineer', company: 'Acme Corp', location: 'Remote'},
  {id: '2', title: 'Backend Developer', company: 'Globex', location: 'Bengaluru'},
  {id: '3', title: 'Data Analyst', company: 'Initech', location: 'Delhi'},
];

export default function JobsScreen({navigation}: Props) {
  const jobs = useMemo(() => data, []);
  return (
    <View style={styles.screen}>
      <Header title="Jobs" />
      <FlatList
        data={jobs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{item.company} • {item.location}</Text>
            <View style={styles.actions}>
              <Pressable
                onPress={() => navigation.navigate('Details', {jobId: item.id})}
                style={({pressed}) => [
                  styles.button,
                  {backgroundColor: pressed ? colors.accent : colors.black},
                ]}
              >
                <Text style={styles.buttonText}>View Details</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg},
  list: {padding: 16, gap: 12},
  card: {
    backgroundColor: colors.bg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 8, height: 8},
    elevation: 6,
    padding: 16,
    gap: 8,
  },
  title: {color: colors.text, fontWeight: '700', fontSize: 16},
  meta: {color: '#333', fontSize: 14},
  actions: {marginTop: 8},
  button: {paddingVertical: 10, borderRadius: 12},
  buttonText: {color: '#fff', textAlign: 'center', fontWeight: '600'},
});