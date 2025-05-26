"use client";

import { motion } from "framer-motion";

function FloatingPaths() {
  const svgWidth = 696;
  const svgHeight = 316;
  const numPaths = 50;
  
  const paths = Array.from({ length: numPaths }, (_, i) => {
    const t = i / (numPaths - 1);

    // Start at bottom left
    const startX = 0;
    const startY = svgHeight;
    
    // End at right with upward trend
    const endX = svgWidth;
    const endY = svgHeight * (1 - t); // Inverted for upward trend

    // Control points for J-curve
    const cp1X = svgWidth * 0.3;
    const cp1Y = svgHeight - 150 * (1 - t);
    const cp2X = svgWidth * 0.7;
    const cp2Y = endY - 250 * (1 - t);

    const d = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
    const opacity = 0.15 + i * 0.02;
    const width = 0.5 + i * 0.02;

    return { id: i, d, opacity, width };
  });

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        fill="none"
      >
        <defs>
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF0000" />
            <stop offset="16.67%" stopColor="#FF00FF" />
            <stop offset="33.33%" stopColor="#0000FF" />
            <stop offset="50%" stopColor="#00FFFF" />
            <stop offset="66.67%" stopColor="#00FF00" />
            <stop offset="83.33%" stopColor="#FFFF00" />
            <stop offset="100%" stopColor="#FF0000" />
          </linearGradient>
        </defs>
        <title>Rising J-Curves</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="url(#rainbow)"
            strokeWidth={path.width}
            strokeOpacity={path.opacity}
            initial={{ pathLength: 0.3, opacity: path.opacity }}
            animate={{
              pathLength: 1,
              opacity: [path.opacity * 0.5, path.opacity, path.opacity * 0.5],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <FloatingPaths />
    </div>
  );
}