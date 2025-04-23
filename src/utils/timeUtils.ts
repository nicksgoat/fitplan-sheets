
import { formatDistance, formatDistanceToNow, format } from 'date-fns';

export const formatRelativeTime = (timestamp: string) => {
  if (!timestamp) return 'Unknown time';
  
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateRange = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 'Date not specified';
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const sameDay = start.toDateString() === end.toDateString();
    
    if (sameDay) {
      return `${format(start, 'MMMM d, yyyy')} ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    }
    
    return `${format(start, 'MMMM d, yyyy h:mm a')} - ${format(end, 'MMMM d, yyyy h:mm a')}`;
  } catch (error) {
    return 'Invalid date range';
  }
};

export const formatDate = (timestamp: string) => {
  if (!timestamp) return 'Unknown date';
  
  try {
    return format(new Date(timestamp), 'MMMM d, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatTime = (timestamp: string) => {
  if (!timestamp) return 'Unknown time';
  
  try {
    return format(new Date(timestamp), 'MMMM d, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateTime = (timestamp: string) => {
  if (!timestamp) return 'Unknown time';
  
  try {
    return format(new Date(timestamp), 'MMMM d, yyyy h:mm a');
  } catch (error) {
    return 'Invalid date';
  }
};

export default {
  formatRelativeTime,
  formatDateRange,
  formatDate,
  formatTime,
  formatDateTime
};
