
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
}

const ProductSchema: React.FC<ProductSchemaProps> = ({
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
}) => {
  const schemaData: any = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": name,
    "description": description,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "price": price,
      "priceCurrency": currency,
      "availability": `https://schema.org/${availability}`
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

  // Add review data if available
  if (reviewCount && reviewRating) {
    schemaData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": reviewRating,
      "reviewCount": reviewCount
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export default ProductSchema;
