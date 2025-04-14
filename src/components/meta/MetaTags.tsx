
import React from 'react';

interface MetaTagsProps {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  preload?: Array<{
    href: string;
    as: 'image' | 'font' | 'style' | 'script';
    type?: string;
  }>;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  imageUrl = 'https://lovable.dev/opengraph-image-p98pqg.png',
  url,
  type = 'website',
  preload = [],
}) => {
  const fullUrl = url ? `${window.location.origin}${url}` : window.location.href;
  
  return (
    <>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      
      {/* OpenGraph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />
      
      {/* Mobile specific */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="theme-color" content="#000000" />
      
      {/* Preload critical resources */}
      {preload.map((resource, index) => (
        <link 
          key={index} 
          rel="preload" 
          href={resource.href} 
          as={resource.as}
          type={resource.type}
        />
      ))}
    </>
  );
};

export default MetaTags;
