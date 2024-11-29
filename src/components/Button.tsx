import React from 'react';
import { Loader2 } from 'lucide-react';
import { useUI } from '../hooks/useUI';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  loadingKey?: string;
  icon?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
  secondary: 'text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50',
  danger: 'text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50',
  success: 'text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50',
  ghost: 'text-gray-600 hover:text-gray-700 border-transparent bg-transparent hover:bg-gray-50'
};

const sizeClasses = {
  xs: 'h-7 px-2 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-4 text-sm'
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  loadingKey,
  className = '',
  disabled,
  icon,
  size = 'md',
  fullWidth = false,
  ...props
}, ref) => {
  const { isLoading } = useUI();
  const loading = loadingKey ? isLoading(loadingKey) : false;

  return (
    <button
      ref={ref}
      disabled={loading || disabled}
      className={`
        relative inline-flex items-center justify-center transition-colors
        border rounded-md font-medium whitespace-nowrap
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${loading ? 'cursor-wait opacity-70' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : icon ? (
        <span className="mr-2 flex-shrink-0">{icon}</span>
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;