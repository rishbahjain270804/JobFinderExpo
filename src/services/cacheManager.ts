import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clear all job-related caches
 * Call this when user updates their profile or logs out
 */
export async function clearAllJobCaches(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const jobCacheKeys = keys.filter(key => key.startsWith('cached_jobs_'));
    
    if (jobCacheKeys.length > 0) {
      await AsyncStorage.multiRemove(jobCacheKeys);
      console.log(`Cleared ${jobCacheKeys.length} job cache entries`);
    }
  } catch (error) {
    console.error('Error clearing job caches:', error);
  }
}

/**
 * Clear cache for specific search
 */
export async function clearCacheForSearch(searchQuery: string, location: string): Promise<void> {
  try {
    const cacheKey = `cached_jobs_${searchQuery.toLowerCase().replace(/\s+/g, '_')}_${location.toLowerCase().replace(/\s+/g, '_')}`;
    await AsyncStorage.removeItem(cacheKey);
    console.log(`Cleared cache for: "${searchQuery}" in "${location}"`);
  } catch (error) {
    console.error('Error clearing specific cache:', error);
  }
}
