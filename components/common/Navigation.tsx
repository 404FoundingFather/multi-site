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
      const isExternal = item.isExternal || item.path.startsWith('http');
      const hasChildren = item.children && item.children.length > 0;
      
      // Check if this item or any of its children is active
      const isActive = currentPath === item.path || 
        (item.path !== '/' && currentPath.startsWith(item.path));
      
      const [isExpanded, setIsExpanded] = useState(false);
      
      // Toggle submenu expansion
      const toggleExpand = (e: React.MouseEvent) => {
        if (expandable && hasChildren) {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      };
      
      // Generate a stable key
      const itemKey = `nav-${item.path.replace(/[^a-z0-9]/gi, '-')}-${item.order}`;
      
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
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              className={isActive ? 'active' : ''}
            >
              {showIcons && item.icon && <span className={`icon ${item.icon}`}></span>}
              <span className="nav-label">{item.label}</span>
            </a>
          ) : (
            <>
              <Link 
                href={item.path}
                className={isActive ? 'active' : ''}
              >
                {showIcons && item.icon && <span className={`icon ${item.icon}`}></span>}
                <span className="nav-label">{item.label}</span>
              </Link>
              
              {hasChildren && expandable && (
                <button 
                  className="expand-toggle"
                  aria-expanded={isExpanded}
                  onClick={toggleExpand}
                  aria-label={`Expand ${item.label} submenu`}
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