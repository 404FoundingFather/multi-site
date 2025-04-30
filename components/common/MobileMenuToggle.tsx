import React from 'react';

interface MobileMenuToggleProps {
  /**
   * Whether the menu is currently open
   */
  isOpen: boolean;
  /**
   * Function to toggle the menu state
   */
  onToggle: () => void;
  /**
   * Custom CSS class
   */
  className?: string;
  /**
   * Accessible label for the toggle button
   */
  ariaLabel?: string;
}

/**
 * MobileMenuToggle - A hamburger menu button for mobile navigation
 */
const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({
  isOpen,
  onToggle,
  className = '',
  ariaLabel = 'Toggle navigation menu'
}) => {
  const toggleClasses = [
    'nav-toggle',
    isOpen ? 'open' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button 
      className={toggleClasses}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={ariaLabel}
      type="button"
    >
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
};

export default MobileMenuToggle; 