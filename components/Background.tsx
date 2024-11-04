'use client'

export default function Background() {
  return (
    <div 
      className="fixed inset-0 w-full h-full bg-black" 
      style={{ 
        zIndex: -1,
        position: 'fixed',
        pointerEvents: 'none',
        background: 'linear-gradient(to bottom right, #000000, #111111, #000000)'
      }} 
    />
  );
}
