import { useMotionPreference } from './useMotionPreference';
import { useMotionValue, useSpring } from 'framer-motion';

export function usePointerTilt(amount = 5) {
  const reduced = useMotionPreference();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 180, damping: 24 });
  const rotateY = useSpring(y, { stiffness: 180, damping: 24 });
  const reset = () => { x.set(0); y.set(0); };
  const onPointerMove = (event) => {
    if (reduced || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set(-(event.clientY - box.top - box.height / 2) / box.height * amount * 2);
    y.set((event.clientX - box.left - box.width / 2) / box.width * amount * 2);
  };
  return {
    style: reduced ? {} : { rotateX, rotateY, transformPerspective: 1000 },
    onPointerMove, onPointerLeave: reset, onPointerCancel: reset, onBlur: reset,
  };
}

