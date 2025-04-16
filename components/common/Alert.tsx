import React, { useState } from 'react';

export interface AlertProps {
  /**
   * Alert content
   */
  children: React.ReactNode;
  /**
   * Alert variant/severity
   */
  variant: 'info' | 'success' | 'warning' | 'error';
  /**
   * Optional title for the alert
   */
  title?: string;
  /**
   * Whether alert can be dismissed
   */
  dismissible?: boolean;
  /**
   * Function called when alert is dismissed
   */
  onDismiss?: () => void;
  /**
   * Additional CSS class
   */
  className?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className = '',
}, ref) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const alertClasses = [
    'alert',
    `alert-${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={alertClasses} role="alert" ref={ref}>
      {dismissible && (
        <button
          type="button"
          className="alert-dismiss"
          aria-label="Close"
          onClick={handleDismiss}
        >
          &times;
        </button>
      )}
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
      </div>
    </div>
  );
});

Alert.displayName = 'Alert';

export default Alert;