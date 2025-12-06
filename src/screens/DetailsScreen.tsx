import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Pressable, Linking} from 'react-native';
import {colors} from '../theme/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Feather} from '@expo/vector-icons';
import {matchJobsToProfile, Job, UserProfile} from '../services/jobMatcher';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

export default function DetailsScreen({navigation, route}: Props) {
  const [job, setJob] = useState<Job | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadJobDetails();
  }, []);

  const loadJobDetails = async () => {
    try {
      const profileData = await AsyncStorage.getItem('profileManualData');
      if (profileData) {
        const userProfile = JSON.parse(profileData);
        setProfile(userProfile);
        
        const jobs = await matchJobsToProfile(userProfile);
        const foundJob = jobs.find(j => j.id === route.params?.jobId);
        if (foundJob) {
          setJob(foundJob);
        }
      }
    } catch (error) {
      console.error('Failed to load job:', error);
    }
  };

  const handleApply = async () => {
    if (!job) return;
    
    try {
      // Use the actual job URL from Adzuna if available
      const url = job.applyUrl || `https://www.adzuna.in/jobs/${job.id}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        
        // Track application in AsyncStorage with date
        const appliedJobsData = await AsyncStorage.getItem('appliedJobsWithDates');
        const appliedJobs = appliedJobsData ? JSON.parse(appliedJobsData) : {};
        
        if (!appliedJobs[job.id]) {
          appliedJobs[job.id] = {
            jobId: job.id,
            appliedDate: new Date().toISOString(),
            job: job,
          };
          await AsyncStorage.setItem('appliedJobsWithDates', JSON.stringify(appliedJobs));
          
          // Keep backward compatibility with simple array
          const simpleArray = await AsyncStorage.getItem('appliedJobs');
          const applied = simpleArray ? JSON.parse(simpleArray) : [];
          if (!applied.includes(job.id)) {
            applied.push(job.id);
            await AsyncStorage.setItem('appliedJobs', JSON.stringify(applied));
          }
        }
      } else {
        console.error('Cannot open URL:', url);
      }
    } catch (error) {
      console.error('Error opening job URL:', error);
    }
  };

  const handleSave = async () => {
    if (!job) return;
    
    try {
      const savedJobsData = await AsyncStorage.getItem('savedJobs');
      const savedJobs = savedJobsData ? JSON.parse(savedJobsData) : [];
      
      if (saved) {
        // Remove from saved
        const filtered = savedJobs.filter((j: Job) => j.id !== job.id);
        await AsyncStorage.setItem('savedJobs', JSON.stringify(filtered));
        setSaved(false);
      } else {
        // Add to saved
        savedJobs.push(job);
        await AsyncStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        setSaved(true);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  useEffect(() => {
    checkIfSaved();
  }, [job]);

  const checkIfSaved = async () => {
    if (!job) return;
    
    try {
      const savedJobsData = await AsyncStorage.getItem('savedJobs');
      if (savedJobsData) {
        const savedJobs = JSON.parse(savedJobsData);
        const isSaved = savedJobs.some((j: Job) => j.id === job.id);
        setSaved(isSaved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const getMatchColor = (score: number = 0) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return colors.accent;
    return '#f59e0b';
  };

  if (!job) {
    return (
      <View style={[styles.screen, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={styles.loadingText}>Loading job details...</Text>
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
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Feather name={saved ? 'heart' : 'heart'} size={24} color={saved ? colors.accent : '#ccc'} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Match Score */}
          <View style={[styles.matchBanner, {backgroundColor: getMatchColor(job.matchScore)}]}>
            <Feather name="star" size={20} color="#fff" />
            <Text style={styles.matchBannerText}>{job.matchScore}% Match • Great Fit!</Text>
          </View>

          {/* Job Header */}
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.company}>{job.company}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Feather name="map-pin" size={14} color={colors.accent} />
                <Text style={styles.metaChipText}>{job.location}</Text>
              </View>
              <View style={styles.metaChip}>
                <Feather name="briefcase" size={14} color={colors.accent} />
                <Text style={styles.metaChipText}>{job.type}</Text>
              </View>
              <View style={styles.metaChip}>
                <Feather name="clock" size={14} color={colors.accent} />
                <Text style={styles.metaChipText}>{job.posted}</Text>
              </View>
            </View>
          </View>

          {/* Salary */}
          <View style={styles.salaryCard}>
            <Feather name="dollar-sign" size={24} color={colors.accent} />
            <View>
              <Text style={styles.salaryLabel}>Salary Range</Text>
              <Text style={styles.salaryValue}>{job.salary}</Text>
            </View>
          </View>

          {/* Match Reasons */}
          {job.matchReasons && job.matchReasons.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Why You're a Great Match</Text>
              {job.matchReasons.map((reason, idx) => (
                <View key={idx} style={styles.reasonItem}>
                  <View style={styles.reasonIcon}>
                    <Feather name="check" size={16} color="#10b981" />
                  </View>
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Role</Text>
            <Text style={styles.description}>{job.description}</Text>
          </View>

          {/* Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {job.requirements.map((req, idx) => (
              <View key={idx} style={styles.requirementItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            <View style={styles.benefitsGrid}>
              {job.benefits.map((benefit, idx) => (
                <View key={idx} style={styles.benefitChip}>
                  <Feather name="check-circle" size={14} color={colors.accent} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleApply}
          style={({pressed}) => [
            styles.applyButton,
            pressed && styles.applyButtonPressed,
          ]}
        >
          <Text style={styles.applyButtonText}>Apply Now</Text>
          <Feather name="arrow-right" size={20} color="#fff" />
        </Pressable>
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    padding: 24,
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  matchBannerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  jobHeader: {
    marginBottom: 24,
  },
  jobTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  company: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 129, 129, 0.1)',
  },
  metaChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  salaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(220, 129, 129, 0.1)',
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  salaryLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    marginBottom: 4,
  },
  salaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  reasonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonText: {
    flex: 1,
    fontSize: 15,
    color: '#166534',
    fontWeight: '600',
    lineHeight: 22,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 26,
    fontWeight: '400',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 20,
    color: colors.accent,
    fontWeight: '700',
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    fontWeight: '500',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  benefitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 129, 129, 0.1)',
  },
  benefitText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  applyButtonPressed: {
    opacity: 0.8,
    transform: [{scale: 0.98}],
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
});