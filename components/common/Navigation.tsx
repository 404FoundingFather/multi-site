import React, { useState } from 'react';
import Link from 'next/link';
import { useNavigation } from '../../contexts/NavigationContext';
import { NavigationItem } from '../../lib/firebase/schema';

export interface NavigationProps {
  /**
   * Navigation items to display
   */
  items: NavigationItem[];
  /**
   * Whether the navigation is horizontal (default) or vertical
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Custom CSS class
   */
  className?: string;
  /**
   * ARIA label for the navigation
   */
  ariaLabel?: string;
  /**
   * Whether to expand submenus on hover (horizontal) or click (vertical)
   */
  expandable?: boolean;
  /**
   * Whether to show icons (if available in the navigation items)
   */
  showIcons?: boolean;
  /**
   * Current active path for highlighting
   */
  activePath?: string;
}

export const Navigation = React.forwardRef<HTMLElement, NavigationProps>(({
  items,
  orientation = 'horizontal',
  className = '',
  ariaLabel = 'Main navigation',
  expandable = true,
  showIcons = false,
  activePath
}, ref) => {
  const { activeItemPath } = useNavigation();
  // Use provided activePath or fall back to context
  const currentPath = activePath || activeItemPath || '';
  
  const navClasses = [
    'site-navigation',
    `site-navigation-${orientation}`,
    className
  ].filter(Boolean).join(' ');

  // Render nested navigation items recursively
  const renderItems = (navItems: NavigationItem[], level = 0) => {
    return navItems.map((item) => {
      // Ensure item.path exists before using it
      const path = item.path || '';
      
      const isExternal = item.isExternal || (path && path.startsWith('http'));
      const hasChildren = item.children && item.children.length > 0;
      
      // Check if this item or any of its children is active
      const isActive = currentPath === path || 
        (path && path !== '/' && currentPath.startsWith(path));
      
      const [isExpanded, setIsExpanded] = useState(false);
      
      // Toggle submenu expansion
      const toggleExpand = (e: React.MouseEvent) => {
        if (expandable && hasChildren) {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      };
      
      // Generate a stable key using safer operations
      const itemKey = `nav-${path.replace(/[^a-z0-9]/gi, '-')}-${item.order || 0}`;
      
      return (
        <li 
          key={itemKey} 
          className={[
            hasChildren ? 'has-children' : '',
            isActive ? 'active' : '',
            isExpanded ? 'expanded' : ''
          ].filter(Boolean).join(' ')}
        >
          {isExternal ? (
            <a
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              className={isActive ? 'active' : ''}
            >
              {showIcons && item.icon && <span className={`icon ${item.icon}`}></span>}
              <span className="nav-label">{item.label || 'Link'}</span>
            </a>
          ) : (
            <>
              <Link 
                href={path}
                className={isActive ? 'active' : ''}
              >
                {showIcons && item.icon && <span className={`icon ${item.icon}`}></span>}
                <span className="nav-label">{item.label || 'Link'}</span>
              </Link>
              
              {hasChildren && expandable && (
                <button 
                  className="expand-toggle"
                  aria-expanded={isExpanded}
                  onClick={toggleExpand}
                  aria-label={`Expand ${item.label || 'Menu'} submenu`}
                >
                  <span className="visually-hidden">
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                  <span className="toggle-icon"></span>
                </button>
              )}
            </>
          )}
          
          {hasChildren && (
            <ul className={`submenu level-${level + 1} ${isExpanded ? 'expanded' : ''}`}>
              {renderItems(item.children, level + 1)}
            </ul>
          )}
        </li>
      );
    });
  };

  // Safety check for items array to prevent errors
  if (!items || !Array.isArray(items)) {
    console.warn('Navigation component received invalid items:', items);
    return (
      <nav className={navClasses} aria-label={ariaLabel} ref={ref}>
        <ul className="nav-list"></ul>
      </nav>
    );
  }

  return (
    <nav className={navClasses} aria-label={ariaLabel} ref={ref}>
      <ul className="nav-list">
        {renderItems(items)}
      </ul>
    </nav>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;