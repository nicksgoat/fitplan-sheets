
// Utility functions for working with time

/**
 * Formats a date string or timestamp as a relative time string
 * (e.g., "5 minutes ago", "2 days ago")
 */
export const formatRelativeTime = (date: string | Date | null): string => {
  if (!date) return 'Unknown time';
  
  const now = new Date();
  const pastDate = typeof date === 'string' ? new Date(date) : date;
  
  const seconds = Math.round((now.getTime() - pastDate.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);
  
  if (seconds < 60) {
    return seconds <= 1 ? 'just now' : `${seconds} seconds ago`;
  } else if (minutes < 60) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  } else if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (days < 30) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else if (months < 12) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
};

/**
 * Formats a date in a standardized format (e.g., "Apr 23, 2025")
 */
export const formatDate = (date: string | Date | null): string => {
  if (!date) return 'Unknown date';
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return new Date(date).toLocaleDateString(undefined, options);
};

/**
 * Formats a time in a standardized format (e.g., "2:30 PM")
 */
export const formatTime = (date: string | Date | null): string => {
  if (!date) return 'Unknown time';
  
  const options: Intl.DateTimeFormatOptions = { 
    hour: 'numeric', 
    minute: 'numeric',
    hour12: true
  };
  
  return new Date(date).toLocaleTimeString(undefined, options);
};
