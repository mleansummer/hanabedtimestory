import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  transparent?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', transparent = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
          variant === 'primary' && !transparent && 'bg-boho-stone text-white hover:bg-boho-stone/90 focus:ring-boho-stone',
          variant === 'secondary' && !transparent && 'bg-boho-cream text-boho-stone hover:bg-boho-clay/20 focus:ring-boho-stone',
          transparent && 'bg-transparent hover:bg-white/10',
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2 text-base',
          size === 'lg' && 'px-6 py-3 text-lg',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;