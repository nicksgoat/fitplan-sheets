
// Type definitions for Google Analytics gtag
interface Window {
  gtag: (
    command: string,
    action: string,
    params: {
      currency?: string;
      value?: number;
      items?: Array<{
        item_id?: string;
        item_name?: string;
        item_category?: string;
        price?: number;
      }>;
      [key: string]: any;
    }
  ) => void;
}
