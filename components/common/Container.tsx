import React, { HTMLAttributes, forwardRef } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width of the container
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Whether to center the container horizontally
   */
  centered?: boolean;
  /**
   * Whether to add padding to the container
   */
  padded?: boolean;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(({
  children,
  maxWidth = 'lg',
  centered = true,
  padded = true,
  className = '',
  ...props
}, ref) => {
  const containerClasses = [
    'container',
    `container-${maxWidth}`,
    centered ? 'container-centered' : '',
    padded ? 'container-padded' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} ref={ref} {...props}>
      {children}
    </div>
  );
});

Container.displayName = 'Container';

export default Container;