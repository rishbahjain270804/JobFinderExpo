import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, ScrollView, RefreshControl} from 'react-native';
import {colors} from '../theme/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Feather} from '@expo/vector-icons';
import {Job} from '../services/jobMatcher';

type Props = NativeStackScreenProps<RootStackParamList, 'AppliedJobs'>;

interface AppliedJob extends Job {
  appliedDate: string;
}

export default function AppliedJobsScreen({navigation}: Props) {
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAppliedJobs();
  }, []);

  const loadAppliedJobs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const appliedJobsData = await AsyncStorage.getItem('appliedJobsWithDates');
      if (appliedJobsData) {
        const appliedJobsMap = JSON.parse(appliedJobsData);
        
        // Convert object to array and sort by date (newest first)
        const jobs: AppliedJob[] = Object.values(appliedJobsMap)
          .map((item: any) => ({
            ...item.job,
            appliedDate: item.appliedDate,
          }))
          .sort((a: AppliedJob, b: AppliedJob) => 
            new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
          );
        
        setAppliedJobs(jobs);
      }
    } catch (error) {
      console.error('Error loading applied jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getMatchColor = (score: number = 0) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return colors.accent;
    return '#f59e0b';
  };

  if (loading) {
    return (
      <View style={[styles.screen, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={styles.loadingText}>Loading applications...</Text>
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
        <Text style={styles.headerTitle}>My Applications</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAppliedJobs(true)}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {appliedJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="briefcase" size={64} color="#ddd" />
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptyText}>
              When you apply to jobs, they'll appear here.{'\n'}Keep track of all your applications in one place!
            </Text>
            <Pressable
              style={styles.browseButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.browseButtonText}>Find Jobs</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.jobsList}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{appliedJobs.length}</Text>
                <Text style={styles.statLabel}>Applications</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {appliedJobs.filter(j => new Date(j.appliedDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length}
                </Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {Math.round(appliedJobs.reduce((sum, j) => sum + (j.matchScore || 0), 0) / appliedJobs.length)}%
                </Text>
                <Text style={styles.statLabel}>Avg Match</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Applications</Text>
            
            {appliedJobs.map((job) => (
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

                  {/* Applied badge */}
                  <View style={styles.appliedBadge}>
                    <Feather name="check-circle" size={16} color="#10b981" />
                    <Text style={styles.appliedBadgeText}>Applied</Text>
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
                    <View style={styles.metaItem}>
                      <Feather name="clock" size={14} color="#666" />
                      <Text style={styles.metaText}>{formatDate(job.appliedDate)}</Text>
                    </View>
                  </View>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
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
  appliedBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  appliedBadgeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    paddingRight: 100,
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
});
