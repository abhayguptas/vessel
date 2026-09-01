import type { FC } from 'react';

export const VesselLogo: FC<{ size?: number }> = ({ size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 20 L50 85 L80 20 L65 20 L50 55 L35 20 Z" fill="#EA580C" />
      <path d="M50 85 L80 20 L95 20 L50 100 Z" fill="currentColor" />
      <path d="M5 20 L20 20 L50 85 L50 100 Z" fill="#0284C7" />
    </svg>
  );
};
