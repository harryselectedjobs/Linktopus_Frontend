const NODES = [
  { x: 8, y: 18 }, { x: 22, y: 42 }, { x: 6, y: 68 }, { x: 30, y: 84 },
  { x: 92, y: 14 }, { x: 78, y: 38 }, { x: 94, y: 62 }, { x: 72, y: 88 },
  { x: 50, y: 6 }, { x: 50, y: 96 },
];

const LINKS = [
  [0, 1], [1, 2], [2, 3], [0, 8], [8, 4], [4, 5], [5, 6], [6, 7], [7, 9], [3, 9],
];

export default function NetworkBackdrop({ className = "" }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g stroke="#1B6FB0" strokeOpacity="0.14" strokeWidth="0.25">
        {LINKS.map(([a, b], i) => {
          const n1 = NODES[a];
          const n2 = NODES[b];
          return <line key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} />;
        })}
      </g>
      <g>
        {NODES.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={i % 3 === 0 ? 0.8 : 0.5}
            fill={i % 4 === 0 ? "#FF6B4D" : "#1B6FB0"}
            fillOpacity={i % 4 === 0 ? 0.35 : 0.22}
            className="animate-pulse-node"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
