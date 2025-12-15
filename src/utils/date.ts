/**
 * Date utility functions
 */

/**
 * Formats a date string to DD/MM/AAAA format
 * @param dateString - ISO date string or date string
 * @returns Formatted date string in DD/MM/AAAA format
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateString; // Return original if invalid
  }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Converts a date string from DD/MM/AAAA to YYYY-MM-DD format (for input type="date")
 * @param dateString - Date string in DD/MM/AAAA format
 * @returns Date string in YYYY-MM-DD format
 */
export function dateToInputFormat(dateString: string): string {
  if (!dateString) return '';
  
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // If in DD/MM/AAAA format, convert to YYYY-MM-DD
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  
  // Try to parse as Date and convert
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return dateString;
}

/**
 * Converts a date string from YYYY-MM-DD (input format) to DD/MM/AAAA format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date string in DD/MM/AAAA format
 */
export function inputFormatToDate(dateString: string): string {
  if (!dateString) return '';
  
  // If already in DD/MM/AAAA format, return as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  // If in YYYY-MM-DD format, convert to DD/MM/AAAA
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  
  // Try to parse as Date and convert
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return formatDate(dateString);
  }
  
  return dateString;
}

