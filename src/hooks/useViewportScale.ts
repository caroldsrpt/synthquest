import { useState, useEffect } from 'react';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '@/utils/constants';

export function useViewportScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const sx = window.innerWidth / VIEWPORT_WIDTH;
      const sy = window.innerHeight / VIEWPORT_HEIGHT;
      setScale(Math.min(sx, sy));
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return scale;
}
