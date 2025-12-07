import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, ScrollView, Animated, RefreshControl} from 'react-native';
import {colors} from '../theme/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Feather} from '@expo/vector-icons';
import {matchJobsToProfile, getRecommendationMessage, Job, UserProfile} from '../services/jobMatcher';
import JobCardSkeleton from '../components/JobCardSkeleton';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({navigation}: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matchedJobs, setMatchedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [filter, setFilter] = useState<'all' | 'remote' | 'top'>('all');

  useEffect(() => {
    loadDataAndMatch();
  }, []);

  const loadDataAndMatch = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      console.log('Loading profile data from AsyncStorage...');
      const data = await AsyncStorage.getItem('profileManualData');
      
      if (!data) {
        console.log('No profile data found in AsyncStorage');
        setError('No profile found. Please complete onboarding.');
        return;
      }

      const userProfile = JSON.parse(data);
      console.log('Profile loaded:', {
        name: userProfile.name,
        desiredRole: userProfile.desiredRole,
        location: userProfile.location
      });
      setProfile(userProfile);
      
      // Match jobs with real-time data
      console.log('Starting job matching...');
      const jobs = await matchJobsToProfile(userProfile);
      console.log(`Matched ${jobs.length} jobs successfully`);
      
      if (jobs.length === 0) {
        setError('No jobs found. Try updating your profile or check back later.');
      } else {
        setMatchedJobs(jobs);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load jobs: ${errorMessage}`);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    loadDataAndMatch(false);
  };

  const handleRefresh = () => {
    loadDataAndMatch(true);
  };

  const getFilteredJobs = () => {
    if (filter === 'remote') {
      return matchedJobs.filter(j => j.type === 'Remote');
    }
    if (filter === 'top') {
      return matchedJobs.filter(j => (j.matchScore || 0) >= 75);
    }
    return matchedJobs;
  };

  const getMatchColor = (score: number = 0) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return colors.accent;
    return '#f59e0b';
  };

  const getMatchLabel = (score: number = 0) => {
    if (score >= 75) return 'Excellent Match';
    if (score >= 50) return 'Good Match';
    return 'Potential Match';
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={{flex: 1}}>
            <Text style={styles.greeting}>Loading your matches... ✨</Text>
            <Text style={styles.subtitle}>Analyzing the best opportunities for you</Text>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  if (error && matchedJobs.length === 0) {
    return (
      <View style={[styles.screen, {justifyContent: 'center', alignItems: 'center', padding: 24}]}>
        <Feather name="alert-circle" size={64} color="#f59e0b" />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={handleRetry}>
          <Feather name="refresh-cw" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('ManualIntake')}>
          <Text style={styles.secondaryButtonText}>Update Profile</Text>
        </Pressable>
      </View>
    );
  }

  const filteredJobs = getFilteredJobs();

  return (
    <View style={styles.screen}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{flex: 1}}>
            <Text style={styles.greeting}>Hello, {profile?.name || 'there'}! 👋</Text>
            <Text style={styles.subtitle}>
              {getRecommendationMessage(profile || {}, matchedJobs.length)}
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <Pressable
              style={styles.headerButton}
              onPress={() => navigation.navigate('ManualIntake')}
            >
              <Feather name="user" size={22} color={colors.accent} />
            </Pressable>
            <Pressable
              style={styles.headerButton}
              onPress={() => navigation.navigate('AppliedJobs')}
            >
              <Feather name="briefcase" size={22} color={colors.accent} />
            </Pressable>
            <Pressable
              style={styles.headerButton}
              onPress={() => navigation.navigate('SavedJobs')}
            >
              <Feather name="bookmark" size={22} color={colors.accent} />
            </Pressable>
          </View>
        </View>

        {/* Stats */}
        <Animated.View style={[styles.statsContainer, {opacity: fadeAnim}]}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{matchedJobs.length}</Text>
            <Text style={styles.statLabel}>Matches Found</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{matchedJobs.filter(j => (j.matchScore || 0) >= 75).length}</Text>
            <Text style={styles.statLabel}>Top Matches</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{matchedJobs.filter(j => j.type === 'Remote').length}</Text>
            <Text style={styles.statLabel}>Remote</Text>
          </View>
        </Animated.View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          <Pressable
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              All Jobs ({matchedJobs.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, filter === 'top' && styles.filterButtonActive]}
            onPress={() => setFilter('top')}
          >
            <Text style={[styles.filterButtonText, filter === 'top' && styles.filterButtonTextActive]}>
              Top Matches ({matchedJobs.filter(j => (j.matchScore || 0) >= 75).length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, filter === 'remote' && styles.filterButtonActive]}
            onPress={() => setFilter('remote')}
          >
            <Text style={[styles.filterButtonText, filter === 'remote' && styles.filterButtonTextActive]}>
              Remote ({matchedJobs.filter(j => j.type === 'Remote').length})
            </Text>
          </Pressable>
        </View>

        {/* Job List */}
        <View style={styles.jobsSection}>
          <Text style={styles.sectionTitle}>
            {filter === 'all' ? 'Your Best Matches' : filter === 'top' ? 'Top Matches' : 'Remote Jobs'}
          </Text>
          
          {filteredJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No jobs found for this filter.{'\n'}Try selecting a different option.
              </Text>
            </View>
          ) : null}
          
          {filteredJobs.map((job, index) => (
            <Animated.View
              key={job.id}
              style={[
                styles.jobCard,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                },
              ]}
            >
              <Pressable
                onPress={() => navigation.navigate('Details', {jobId: job.id})}
                style={({pressed}) => [
                  styles.jobCardInner,
                  pressed && styles.jobCardPressed,
                ]}
              >
                {/* Match score badge */}
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
                  <View style={styles.metaItem}>
                    <Feather name="dollar-sign" size={14} color="#666" />
                    <Text style={styles.metaText}>{job.salary}</Text>
                  </View>
                </View>

                {/* Match reasons */}
                {job.matchReasons && job.matchReasons.length > 0 && (
                  <View style={styles.matchReasons}>
                    {job.matchReasons.map((reason, idx) => (
                      <View key={idx} style={styles.reasonBadge}>
                        <Text style={styles.reasonText}>✓ {reason}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.jobFooter}>
                  <Text style={styles.postedText}>{job.posted}</Text>
                  <Feather name="chevron-right" size={20} color={colors.accent} />
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 129, 129, 0.1)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  jobsSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  jobCard: {
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  company: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 12,
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
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
  matchReasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  reasonBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  reasonText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  postedText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  secondaryButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});