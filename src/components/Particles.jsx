import { memo, useMemo } from "react";
import { isPhone } from "../utils/barcodeHelpers";

/**
 * CSS-based particle background effect
 * Lightweight alternative to tsparticles (~145kB savings)
 */
const Particles = memo(() => {
  const count = useMemo(() => (isPhone() ? 25 : 50), []);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: Math.random() * 6 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * -20,
      })),
    [count],
  );

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none bg-base-100"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary/80 animate-float"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      {/* Connection lines using SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-20" aria-hidden="true">
        <title>Particle connections</title>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="[stop-color:var(--color-primary)]" stopOpacity="0.3" />
            <stop offset="50%" className="[stop-color:var(--color-primary)]" stopOpacity="0.6" />
            <stop offset="100%" className="[stop-color:var(--color-primary)]" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {particles.slice(0, 15).map((p, i) => {
          const next = particles[(i + 1) % 15];
          return (
            <line
              key={p.id}
              x1={`${p.x}%`}
              y1={`${p.y}%`}
              x2={`${next.x}%`}
              y2={`${next.y}%`}
              stroke="url(#lineGrad)"
              strokeWidth="1"
              className="animate-pulse-slow"
            />
          );
        })}
      </svg>
    </div>
  );
});

export default Particles;
