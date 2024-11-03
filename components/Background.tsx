'use client'

import React from 'react'
import { motion } from 'framer-motion'

const FloatingOrb = React.memo(({ color, size, x, y }: { color: string; size: number; x: string; y: string }) => {
  return (
    <motion.div
      style={{
        position: 'absolute',
        backgroundColor: color,
        width: size,
        height: size,
        borderRadius: '50%',
        filter: 'blur(50px)',
        left: x,
        top: y,
      }}
      animate={{
        opacity: [0.3, 0.5, 0.3],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
});

export function Background() {
  const orbs = [
    { color: 'rgba(118, 185, 0, 0.15)', size: 300, x: '10%', y: '20%' },
    { color: 'rgba(118, 185, 0, 0.1)', size: 200, x: '60%', y: '50%' },
    { color: 'rgba(118, 185, 0, 0.2)', size: 250, x: '80%', y: '80%' },
    { color: 'rgba(118, 185, 0, 0.15)', size: 180, x: '30%', y: '70%' },
    { color: 'rgba(118, 185, 0, 0.1)', size: 220, x: '70%', y: '20%' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden z-[-1]">
      {orbs.map((orb, index) => (
        <FloatingOrb key={index} {...orb} />
      ))}
    </div>
  );
}
