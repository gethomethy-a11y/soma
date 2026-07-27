/** The SOMA brand mark: an open cycle ring with a marker at the top right. */
export function SomaMark({ size = 36, color = "#fff", marker = "#fff" }: { size?: number; color?: string; marker?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle
        cx="50"
        cy="50"
        r="34"
        stroke={color}
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray="168 46"
        transform="rotate(-104 50 50)"
      />
      <circle cx="72" cy="24" r="8.5" fill={marker} />
    </svg>
  );
}
