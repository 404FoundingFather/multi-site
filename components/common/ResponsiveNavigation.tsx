import React, { useState, useEffect, useRef } from 'react';
import TenantNavigation from './TenantNavigation';
import MobileMenuToggle from './MobileMenuToggle';

interface ResponsiveNavigationProps {
  /**
   * Type of navigation to display
   */
  type?: 'main' | 'footer' | 'sidebar';
  /**
   * Custom CSS class
   */
  className?: string;
  /**
   * Breakpoint for mobile menu in pixels (default: 768)
   */
  mobileBreakpoint?: number;
}

/**
 * ResponsiveNavigation - A responsive navigation component that adapts to screen size
 * Displays a hamburger menu on mobile devices
 */
const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  type = 'main',
  className = '',
  mobileBreakpoint = 768
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navRef = useRef<HTMLElement>(null);
  
  // Check if we're on mobile based on window width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [mobileBreakpoint]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node) && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Add mobile menu class to nav list when menu is open
  useEffect(() => {
    if (!navRef.current) return;
    
    const navList = navRef.current.querySelector('.nav-list');
    if (navList) {
      if (isMenuOpen) {
        navList.classList.add('expanded');
      } else {
        navList.classList.remove('expanded');
      }
    }
  }, [isMenuOpen]);
  
  return (
    <div className={`responsive-navigation ${className}`}>
      {isMobile && type === 'main' && (
        <MobileMenuToggle
          isOpen={isMenuOpen}
          onToggle={toggleMenu}
          className="mobile-menu-toggle"
        />
      )}
      
      <TenantNavigation
        ref={navRef}
        type={type}
        className={isMenuOpen ? 'menu-open' : ''}
      />
    </div>
  );
};

export default ResponsiveNavigation; 