'use client';

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type SpringOptions } from 'motion/react';
import { useEffect, useState, type PointerEvent, type ReactNode } from 'react';

const WORDMARK = 'CVskills';
/** Extrusion layers behind the face, deepest first, so the face paints last. */
const DEPTHS = [-48, -32, -16, 0];
const TILT_DEG = 8;
const SPRING: SpringOptions = { stiffness: 140, damping: 18, mass: 0.6 };
/** Mirrors the hero-logo-zoom keyframes in hero.css, for the JS fallback. */
const ZOOM_STOPS = [0, 0.55, 1];
const ZOOM_SCALE = [1, 1.44, 1.8];
const ZOOM_OPACITY = [1, 0.3, 0];
const ZOOM_BRIGHTNESS = [1, 0.45, 0.45];

/** Browsers without scroll-timeline support (Firefox today) fall back to JS.
 * Matches the CSS range: the zoom completes over the first 90vh of scroll. */
function ZoomFallback({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const [end, setEnd] = useState(800);
  useEffect(() => {
    const measure = () => setEnd(window.innerHeight * 0.9);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const px = ZOOM_STOPS.map((s) => s * end);
  const scale = useTransform(scrollY, px, ZOOM_SCALE);
  const opacity = useTransform(scrollY, px, ZOOM_OPACITY);
  const brightness = useTransform(scrollY, px, ZOOM_BRIGHTNESS);
  const filter = useMotionTemplate`brightness(${brightness})`;

  return (
    <motion.div className="hero-logo3d-zoom" style={{ scale, opacity, filter }}>
      {children}
    </motion.div>
  );
}

export function HeroLogo3D() {
  const reduced = useReducedMotion();
  // Detected after mount — CSS is undefined during SSR, and assuming the
  // supported path keeps the server and first client render identical.
  const [needsJsZoom, setNeedsJsZoom] = useState(false);
  useEffect(() => {
    setNeedsJsZoom(!CSS.supports('animation-timeline: scroll()'));
  }, []);

  // -1..1 across the element, springed so the mark trails the pointer instead of snapping.
  const px = useSpring(useMotionValue(0), SPRING);
  const py = useSpring(useMotionValue(0), SPRING);
  const rotateY = useTransform(px, [-1, 1], [-TILT_DEG, TILT_DEG]);
  const rotateX = useTransform(py, [-1, 1], [TILT_DEG, -TILT_DEG]);

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduced) return;
    const box = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - box.left) / box.width) * 2 - 1);
    py.set(((e.clientY - box.top) / box.height) * 2 - 1);
  }

  function onPointerLeave() {
    px.set(0);
    py.set(0);
  }

  const layers = DEPTHS.map((z, i) => (
    <span
      key={z}
      className={z === 0 ? 'hero-logo3d-layer face' : 'hero-logo3d-layer'}
      style={{ transform: `translateZ(${z}px)`, opacity: z === 0 ? 1 : 0.16 + i * 0.12 }}
      aria-hidden={z === 0 ? undefined : true}
    >
      {WORDMARK}
    </span>
  ));

  if (reduced) {
    return (
      <div className="hero-logo3d">
        <div className="hero-logo3d-zoom">
          <div className="hero-logo3d-stack" style={{ transform: 'rotateX(4deg) rotateY(-6deg)' }}>
            {layers}
          </div>
        </div>
      </div>
    );
  }

  const stack = (
    <motion.div
      className="hero-logo3d-stack"
      style={{ rotateX, rotateY }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      {layers}
    </motion.div>
  );

  return (
    <div className="hero-logo3d" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      {needsJsZoom ? <ZoomFallback>{stack}</ZoomFallback> : <div className="hero-logo3d-zoom">{stack}</div>}
    </div>
  );
}
