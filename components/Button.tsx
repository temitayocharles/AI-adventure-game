import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg";
  
  const variants = {
    primary: "bg-gradient-to-b from-hero-blue to-blue-600 text-white border-b-4 border-blue-800 hover:brightness-110 focus:ring-blue-300",
    secondary: "bg-gradient-to-b from-hero-yellow to-yellow-500 text-yellow-900 border-b-4 border-yellow-700 hover:brightness-110 focus:ring-yellow-200",
    danger: "bg-gradient-to-b from-red-400 to-red-600 text-white border-b-4 border-red-800 hover:brightness-110 focus:ring-red-300",
    success: "bg-gradient-to-b from-hero-green to-green-600 text-green-900 border-b-4 border-green-800 hover:brightness-110 focus:ring-green-300",
    glass: "bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 focus:ring-white/50"
  };

  const sizes = {
    sm: "px-4 py-1 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
