import { useMotionPreference } from '../hooks/useMotionPreference';
import { useRef } from 'react';
import { usePointerTilt } from '../hooks/usePointerTilt';
import { motion as Motion, useScroll, useTransform } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

export function RevealHeading({ children }) {
  const reduced = useMotionPreference();
  return (
    <Motion.h2 className="reveal-heading"
      initial={reduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: false, amount: 0.4 }}
    >
      <Motion.span
        variants={{ hidden: { y: '105%', opacity: 0 }, visible: { y: 0, opacity: 1 } }}
        transition={{ duration: reduced ? 0 : 0.7, ease }}
      >{children}</Motion.span>
    </Motion.h2>
  );
}

export function MotionSection({ children, className = 'section', id, number }) {
  const ref = useRef(null);
  const reduced = useMotionPreference();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 0.35, 1], [20, 0, -14]);
  return (
    <Motion.section ref={ref} id={id} className={className} style={reduced ? {} : { y }}>
      <div className="section-index" aria-hidden="true"><span>{number}</span><i /></div>
      {children}
    </Motion.section>
  );
}

export function RevealCard({ children, className, index = 0, ...props }) {
  const reduced = useMotionPreference();
  return (
    <Motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.12, margin: '0px 0px -24px 0px' }}
      transition={{ duration: reduced ? 0 : 0.55, delay: reduced ? 0 : Math.min(index, 3) * 0.06, ease }}
      {...props}
    >{children}</Motion.div>
  );
}

export function InteractiveProject({ children, style, index }) {
  const tilt = usePointerTilt(3);
  return (
    <RevealCard className="project-reveal" index={index}>
      <Motion.article className="project-card project-showcase-card" tabIndex={0} {...tilt} style={{ ...style, ...tilt.style }}>
        {children}
      </Motion.article>
    </RevealCard>
  );
}
