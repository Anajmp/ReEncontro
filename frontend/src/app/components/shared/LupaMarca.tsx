export function LupaMarca({
  size = 148,
  color = '#C8102E',
  fill = 'none',
}: {
  size?: number;
  color?: string;
  fill?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="9.5" stroke={color} strokeWidth="2.3" fill={fill} />
      <path d="M21.5 21.5 L30 30" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="8.5" cy="8.5" r="1.7" fill={color} fillOpacity="0.38" />
      <circle cx="20.5" cy="8" r="1.1" fill={color} fillOpacity="0.28" />
      <circle cx="22" cy="21" r="0.9" fill={color} fillOpacity="0.32" />
      <circle cx="7" cy="21" r="1.3" fill={color} fillOpacity="0.2" />
    </svg>
  );
}
