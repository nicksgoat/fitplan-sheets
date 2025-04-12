
import React from 'react';

interface ProductSchemaProps {
  name: string;
  description: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
  brand?: string;
  reviewCount?: number;
  reviewRating?: number;
  category?: string;
  offerCount?: number;
  url?: string;
  seller?: {
    name: string;
    url?: string;
  };
}

const EnhancedProductSchema: React.FC<ProductSchemaProps> = ({
  name,
  description,
  imageUrl,
  price = 0,
  currency = 'USD',
  availability = 'InStock',
  sku,
  brand = 'FitBloom',
  reviewCount,
  reviewRating,
  category = 'Fitness',
  offerCount = 1,
  url,
  seller
}) => {
  const fullUrl = url || window.location.href;
  
  const schemaData: any = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": name,
    "description": description,
    "category": category,
    "offers": {
      "@type": "Offer",
      "url": fullUrl,
      "price": price,
      "priceCurrency": currency,
      "availability": `https://schema.org/${availability}`,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "offerCount": offerCount
    }
  };

  if (imageUrl) {
    schemaData.image = imageUrl;
  }

  if (sku) {
    schemaData.sku = sku;
  }

  if (brand) {
    schemaData.brand = {
      "@type": "Brand",
      "name": brand
    };
  }

  if (seller) {
    schemaData.seller = {
      "@type": "Organization",
      "name": seller.name
    };
    
    if (seller.url) {
      schemaData.seller.url = seller.url;
    }
  }

  // Add review data if available
  if (reviewCount && reviewRating) {
    schemaData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": reviewRating,
      "reviewCount": reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export default EnhancedProductSchema;
