import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`card-glass ${hover ? 'hover-lift' : ''} ${className}`}>
      {children}
    </div>
  );
}
