
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
  
  // Extract ID from format "id-slug"
  const idWithSlug = parts[2];
  const id = idWithSlug.split('-')[0];
  
  return id;
};
