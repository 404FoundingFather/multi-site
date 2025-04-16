import React, { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant
   */
  variant?: 'default' | 'outlined' | 'elevated';
  /**
   * Optional card header content
   */
  header?: React.ReactNode;
  /**
   * Optional card footer content
   */
  footer?: React.ReactNode;
  /**
   * Whether to apply padding to the card content
   */
  padded?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  header,
  footer,
  padded = true,
  className = '',
  ...props
}, ref) => {
  const cardClasses = [
    'card',
    `card-${variant}`,
    padded ? 'card-padded' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} ref={ref} {...props}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-content">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;