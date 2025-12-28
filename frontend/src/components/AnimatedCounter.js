import React, { useEffect, useState } from 'react';

export default function AnimatedCounter({ value, duration = 1000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      if (progress < duration) {
        const percentage = progress / duration;
        const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
        setCount(Math.floor(easeOutQuart * value));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <span>
      {prefix}{typeof count === 'number' ? count.toLocaleString('pl-PL') : count}{suffix}
    </span>
  );
}
