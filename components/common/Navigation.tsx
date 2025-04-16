import React from 'react';
import Link from 'next/link';

export interface NavItem {
  /**
   * Display text for the navigation item
   */
  label: string;
  /**
   * URL path for the navigation item
   */
  href: string;
  /**
   * Whether the link should open in a new tab
   */
  isExternal?: boolean;
  /**
   * Unique identifier for the navigation item (used for keys)
   */
  id?: string;
}

export interface NavigationProps {
  /**
   * Navigation items to display
   */
  items: NavItem[];
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
}

export const Navigation = React.forwardRef<HTMLElement, NavigationProps>(({
  items,
  orientation = 'horizontal',
  className = '',
  ariaLabel = 'Main navigation'
}, ref) => {
  const navClasses = [
    'site-navigation',
    `site-navigation-${orientation}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <nav className={navClasses} aria-label={ariaLabel} ref={ref}>
      <ul>
        {items.map((item) => {
          // Use id if provided, otherwise generate a more stable key than index
          const itemKey = item.id || `nav-${item.href.replace(/[^a-z0-9]/gi, '-')}`;
          
          return (
            <li key={itemKey}>
              {item.isExternal ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label}
                </a>
              ) : (
                <Link href={item.href}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;