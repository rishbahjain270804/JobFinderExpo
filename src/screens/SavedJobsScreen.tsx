import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, ScrollView, RefreshControl} from 'react-native';
import {colors} from '../theme/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Feather} from '@expo/vector-icons';
import {Job} from '../services/jobMatcher';

type Props = NativeStackScreenProps<RootStackParamList, 'Jobs'>;

export default function SavedJobsScreen({navigation}: Props) {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const savedJobsData = await AsyncStorage.getItem('savedJobs');
      if (savedJobsData) {
        const jobs = JSON.parse(savedJobsData);
        setSavedJobs(jobs);
      }
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemove = async (jobId: string) => {
    try {
      const filtered = savedJobs.filter(j => j.id !== jobId);
      await AsyncStorage.setItem('savedJobs', JSON.stringify(filtered));
      setSavedJobs(filtered);
    } catch (error) {
      console.error('Error removing job:', error);
    }
  };

  const getMatchColor = (score: number = 0) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return colors.accent;
    return '#f59e0b';
  };

  if (loading) {
    return (
      <View style={[styles.screen, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={styles.loadingText}>Loading saved jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Saved Jobs</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadSavedJobs(true)}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {savedJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="bookmark" size={64} color="#ddd" />
            <Text style={styles.emptyTitle}>No Saved Jobs</Text>
            <Text style={styles.emptyText}>
              Jobs you save will appear here.{'\n'}Tap the heart icon on any job to save it!
            </Text>
            <Pressable
              style={styles.browseButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.browseButtonText}>Browse Jobs</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.jobsList}>
            <Text style={styles.countText}>{savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}</Text>
            
            {savedJobs.map((job) => (
              <View key={job.id} style={styles.jobCard}>
                <Pressable
                  onPress={() => navigation.navigate('Details', {jobId: job.id})}
                  style={({pressed}) => [
                    styles.jobCardInner,
                    pressed && styles.jobCardPressed,
                  ]}
                >
                  {/* Match badge */}
                  <View style={[styles.matchBadge, {backgroundColor: getMatchColor(job.matchScore)}]}>
                    <Text style={styles.matchBadgeText}>{job.matchScore}% Match</Text>
                  </View>

                  {/* Job info */}
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.company}>{job.company}</Text>

                  <View style={styles.jobMeta}>
                    <View style={styles.metaItem}>
                      <Feather name="map-pin" size={14} color="#666" />
                      <Text style={styles.metaText}>{job.location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Feather name="briefcase" size={14} color="#666" />
                      <Text style={styles.metaText}>{job.type}</Text>
                    </View>
                  </View>
                </Pressable>

                {/* Remove button */}
                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemove(job.id)}
                >
                  <Feather name="x" size={20} color="#999" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  jobsList: {
    padding: 24,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 16,
  },
  jobCard: {
    marginBottom: 16,
    position: 'relative',
  },
  jobCardInner: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 129, 129, 0.08)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  jobCardPressed: {
    opacity: 0.7,
    transform: [{scale: 0.98}],
  },
  matchBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  matchBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    paddingRight: 40,
  },
  company: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 12,
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
