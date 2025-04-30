import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import Navigation from './Navigation';

export interface TenantNavigationProps {
  /**
   * Type of navigation to display (main, footer, sidebar)
   */
  type: 'main' | 'footer' | 'sidebar';
  /**
   * Custom CSS class
   */
  className?: string;
  /**
   * Whether to show a loading state
   */
  showLoading?: boolean;
  /**
   * Custom ARIA label
   */
  ariaLabel?: string;
}

/**
 * TenantNavigation - A component that renders navigation based on tenant configuration
 * This component automatically loads the appropriate navigation from the NavigationContext
 */
export const TenantNavigation = React.forwardRef<HTMLElement, TenantNavigationProps>(({
  type = 'main',
  className = '',
  showLoading = true,
  ariaLabel
}, ref) => {
  const { 
    mainNavigation, 
    footerNavigation, 
    sidebarNavigation, 
    isLoading, 
    error,
    activeItemPath
  } = useNavigation();
  
  // Get navigation items based on type
  const getNavigationItems = () => {
    switch (type) {
      case 'main':
        return mainNavigation;
      case 'footer':
        return footerNavigation;
      case 'sidebar':
        return sidebarNavigation;
      default:
        return null;
    }
  };
  
  // Get default orientation based on type
  const getOrientation = () => {
    return type === 'sidebar' ? 'vertical' : 'horizontal';
  };
  
  // Get default ARIA label based on type
  const getAriaLabel = () => {
    return ariaLabel || `${type.charAt(0).toUpperCase() + type.slice(1)} navigation`;
  };
  
  const items = getNavigationItems();
  const orientation = getOrientation();
  
  // Handle loading state
  if (isLoading && showLoading) {
    return <div className="navigation-loading">Loading navigation...</div>;
  }
  
  // Handle error state
  if (error) {
    console.error('Error loading navigation:', error);
    return null; // Don't show anything if there's an error
  }
  
  // Handle empty navigation
  if (!items || items.length === 0) {
    return null; // Don't show empty navigation
  }
  
  // Render the navigation
  return (
    <Navigation
      ref={ref}
      items={items}
      orientation={orientation}
      className={`tenant-navigation ${type}-navigation ${className}`}
      ariaLabel={getAriaLabel()}
      expandable={true}
      showIcons={type !== 'footer'}
      activePath={activeItemPath || undefined}
    />
  );
});

TenantNavigation.displayName = 'TenantNavigation';

export default TenantNavigation; 