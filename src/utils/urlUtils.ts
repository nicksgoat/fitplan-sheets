
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
 * Build a product URL based on type, creator username, and product name
 * @param type Product type (workout, program, club)
 * @param creatorUsername Creator's username
 * @param slug Product slug
 * @returns Complete product URL
 */
export const buildCreatorProductUrl = (
  creatorUsername: string, 
  slug: string
): string => {
  return `/${creatorUsername}/${slug}`;
};

/**
 * Legacy URL builder
 * Build a product URL based on type and data (legacy format)
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

/**
 * Extract username and slug from creator-style URLs
 * @param pathname The current path
 * @returns Object with username and slug if format matches, null otherwise
 */
export const parseCreatorUrl = (pathname: string): { username: string, slug: string } | null => {
  // URL format should be /:username/:slug
  const parts = pathname.split('/').filter(Boolean);
  
  if (parts.length !== 2) {
    return null;
  }
  
  return {
    username: parts[0],
    slug: parts[1]
  };
};

/**
 * Check if a URL is in the creator format
 * @param pathname The current path
 * @returns Boolean indicating if the URL is in creator format
 */
export const isCreatorUrl = (pathname: string): boolean => {
  return !!parseCreatorUrl(pathname);
};
