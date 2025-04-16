import React, { forwardRef, useState } from 'react';
import Button from './Button';
import Link from 'next/link';

export interface HeroProps {
  /**
   * Title text for the hero section
   */
  title: string;
  /**
   * Subtitle or description text
   */
  subtitle?: string;
  /**
   * Background image URL
   */
  backgroundImage?: string;
  /**
   * Fallback background color if image fails to load
   */
  fallbackBackgroundColor?: string;
  /**
   * Call to action button text
   */
  ctaText?: string;
  /**
   * Call to action button URL
   */
  ctaUrl?: string;
  /**
   * Alignment of hero content
   */
  alignment?: 'left' | 'center' | 'right';
  /**
   * Additional CSS class
   */
  className?: string;
}

export const Hero = forwardRef<HTMLElement, HeroProps>(({
  title,
  subtitle,
  backgroundImage,
  fallbackBackgroundColor,
  ctaText,
  ctaUrl,
  alignment = 'center',
  className = '',
}, ref) => {
  const [imageError, setImageError] = useState(false);

  const heroClasses = [
    'hero',
    `hero-align-${alignment}`,
    className
  ].filter(Boolean).join(' ');

  // Generate the style object for the hero section
  const heroStyle: React.CSSProperties = {};
  
  // Only set backgroundImage if there's an image and no error loading it
  if (backgroundImage && !imageError) {
    heroStyle.backgroundImage = `url(${backgroundImage})`;
    
    // Preload the image to detect loading errors
    if (typeof window !== 'undefined') {
      const img = new Image();
      img.onerror = () => setImageError(true);
      img.src = backgroundImage;
    }
  }
  
  // Apply fallback background color if specified or if image failed to load
  if (fallbackBackgroundColor || imageError) {
    heroStyle.backgroundColor = fallbackBackgroundColor || 'var(--primaryColor)';
  }

  return (
    <section className={heroClasses} style={heroStyle} ref={ref}>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        {ctaText && ctaUrl && (
          <div className="hero-actions">
            <Button 
              as="a"
              href={ctaUrl}
              variant="primary" 
              size="large"
            >
              {ctaText}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';

export default Hero;