/**
 * Date utility functions for formatting and validation
 * Provides pure functions with strong typing and error handling
 */

/**
 * Format date for display with configurable locale and options
 */
export function formatDate(
  date: Date | string | number,
  locale: string = 'es-ES',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
): string {
  try {
    if (!date) return '';
    
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      console.warn('formatDate: Invalid date provided:', date);
      return '';
    }
    
    return dateObj.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('formatDate: Error formatting date:', error);
    return '';
  }
}

/**
 * Format date for HTML date input (YYYY-MM-DD format)
 */
export function formatDateForInput(date: Date | string | number): string {
  try {
    if (!date) return '';
    
    const dateObj = new Date(date);
    
    if (!isValidDate(dateObj)) {
      console.warn('formatDateForInput: Invalid date provided:', date);
      return '';
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('formatDateForInput: Error formatting date:', error);
    return '';
  }
}

/**
 * Get current date in YYYY-MM-DD format for HTML date inputs
 */
export function getCurrentDate(): string {
  return formatDateForInput(new Date());
}

/**
 * Validate if provided value is a valid date
 */
export function isValidDate(date: any): boolean {
  if (!date) return false;
  
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date | string | number): boolean {
  try {
    const dateObj = new Date(date);
    const now = new Date();
    
    if (!isValidDate(dateObj)) return false;
    
    return dateObj > now;
  } catch (error) {
    console.error('isFutureDate: Error checking future date:', error);
    return false;
  }
} 