import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-8 py-3 rounded-full font-serif font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg";
  
  const variants = {
    primary: "bg-nordic-red text-white hover:bg-red-700 border-2 border-transparent",
    secondary: "bg-nordic-gold text-nordic-dark hover:bg-yellow-400 border-2 border-transparent",
    outline: "bg-transparent border-2 border-nordic-snow text-nordic-snow hover:bg-nordic-snow hover:text-nordic-dark",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};