
/**
 * Format seconds into a human-readable duration string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format a rest time from the workout data into seconds
 */
export function parseRestTime(restTime: string): number {
  if (!restTime) return 0;
  
  // Handle formats like "60s", "1m", "1m 30s", "90"
  let seconds = 0;
  
  // If restTime is just a number, treat it as seconds
  if (!isNaN(Number(restTime))) {
    return Number(restTime);
  }
  
  // Look for minutes
  const minutesMatch = restTime.match(/(\d+)m/);
  if (minutesMatch) {
    seconds += parseInt(minutesMatch[1]) * 60;
  }
  
  // Look for seconds
  const secondsMatch = restTime.match(/(\d+)s/);
  if (secondsMatch) {
    seconds += parseInt(secondsMatch[1]);
  }
  
  return seconds;
}
