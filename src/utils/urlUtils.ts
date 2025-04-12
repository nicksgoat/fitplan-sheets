
/**
 * Generate a SEO-friendly slug from a string
 * @param text The text to convert to slug
 * @returns Formatted slug string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .trim();
};

/**
 * Build a product URL based on type and data
 * @param type Product type (workout, program, club)
 * @param id Product ID
 * @param name Product name for the slug
 * @returns Complete product URL
 */
export const buildProductUrl = (
  type: 'workout' | 'program' | 'club', 
  id: string, 
  name: string
): string => {
  const slug = generateSlug(name);
  return `/${type}/${id}-${slug}`;
};

/**
 * Parse a product URL to extract ID
 * @param url The URL path to parse
 * @returns The extracted product ID
 */
export const parseProductUrl = (url: string): string | null => {
  const parts = url.split('/');
  if (parts.length < 3) return null;
  
  // Extract ID from format "id-slug" or just the ID part
  const idWithSlug = parts[2];
  
  // If there's a dash in the ID, it could be part of a UUID or a separator with the slug
  if (idWithSlug.includes('-')) {
    // First try to extract just the UUID part (before any non-UUID character)
    const fullUuidMatch = idWithSlug.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (fullUuidMatch) {
      return fullUuidMatch[1];
    }
    
    // If not a full UUID with dashes, extract the first part before a non-UUID character
    const idPart = idWithSlug.split('-')[0];
    return idPart;
  }
  
  // If no dash, just return the whole segment as the ID
  return idWithSlug;
};
