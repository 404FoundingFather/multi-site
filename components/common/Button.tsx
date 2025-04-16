import React, { ButtonHTMLAttributes, ElementType, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant - determines styling
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether button takes full width of parent
   */
  fullWidth?: boolean;
  /**
   * Render as a different element (e.g., 'a' for links)
   */
  as?: ElementType;
  /**
   * URL when used as a link (if as="a")
   */
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'medium', 
    fullWidth = false, 
    className = '',
    as: Component = 'button',
    ...props 
  }, ref) => {
    // Generate CSS classes based on props
    const buttonClasses = [
      'btn',
      `btn-${variant}`,
      `btn-size-${size}`,
      fullWidth ? 'btn-full-width' : '',
      className
    ].filter(Boolean).join(' ');
    
    // The "as" prop allows rendering as different elements (e.g., <a>)
    return (
      <Component 
        className={buttonClasses} 
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export default Button;