import React from 'react';

const NiqLogo = ({ className = 'h-8', ...props }) => {
  return (
    <svg
      viewBox="0 0 134 55"
      className={`${className} transition-all duration-150`}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* N */}
      <path
        d="M16 46V10c0-1.1.9-2 2-2h8.2c.6 0 1.2.3 1.6.8l17 19.8V10c0-1.1.9-2 2-2H53c1.1 0 2 .9 2 2v36c0 1.1-.9 2-2 2h-8.2c-.6 0-1.2-.3-1.6-.8L26.2 27.4V46c0 1.1-.9 2-2 2H18c-1.1 0-2-.9-2-2z"
      />
      {/* I */}
      <rect x="61" y="8" width="12" height="40" rx="1.5" />
      {/* Q */}
      <path
        d="M99.5 8c-11.3 0-20.5 9.2-20.5 20.5S88.2 49 99.5 49c4.2 0 8.1-1.3 11.4-3.5l5.5 5.5c.8.8 2 .8 2.8 0l4.2-4.2c.8-.8.8-2 0-2.8l-5.5-5.5c2.2-3.3 3.5-7.2 3.5-11.4C120 17.2 110.8 8 99.5 8zm0 31.5c-6.1 0-11-4.9-11-11s4.9-11 11-11 11 4 11 11-4.9 11-11 11z"
      />
    </svg>
  );
};

export default NiqLogo;
