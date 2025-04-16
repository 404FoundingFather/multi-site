import React, { InputHTMLAttributes, forwardRef, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label for the input
   */
  label?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Help text to display below the input
   */
  helpText?: string;
  /**
   * Whether the input takes full width of parent
   */
  fullWidth?: boolean;
}

/**
 * Input component that can be used in both controlled and uncontrolled forms.
 * 
 * For controlled usage, provide value and onChange props:
 * ```tsx
 * <Input value={value} onChange={(e) => setValue(e.target.value)} />
 * ```
 * 
 * For uncontrolled usage, provide defaultValue and a ref:
 * ```tsx
 * <Input defaultValue="Initial value" ref={inputRef} />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helpText, 
    fullWidth = false, 
    className = '', 
    id,
    ...props 
  }, ref) => {
    // Generate a stable ID with useId hook
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    
    const inputClasses = [
      'input',
      error ? 'input-error' : '',
      fullWidth ? 'input-full-width' : '',
      className
    ].filter(Boolean).join(' ');

    const formControlClasses = [
      'form-control',
      fullWidth ? 'form-control-full-width' : ''
    ].filter(Boolean).join(' ');

    return (
      <div className={formControlClasses}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <input 
          id={inputId}
          className={inputClasses} 
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helpText
                ? `${inputId}-help`
                : undefined
          }
          {...props}
        />
        {error && (
          <div id={`${inputId}-error`} className="input-error-text" role="alert">
            {error}
          </div>
        )}
        {helpText && !error && (
          <div id={`${inputId}-help`} className="input-help-text">
            {helpText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;