import React from 'react';

interface SendButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function SendButton({ onClick, disabled }: SendButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-[#76B900] text-white rounded-full p-2 hover:bg-[#8ed100] transition-colors duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
      </svg>
    </button>
  );
}
