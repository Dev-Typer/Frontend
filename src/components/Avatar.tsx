interface Props {
  handle: string;
  hue?: number;
  size?: number;
  ring?: string;
}

const Avatar = ({ handle, hue = 170, size = 32, ring }: Props) => {
  const initial = (handle || '?').slice(0, 2).toUpperCase();
  return (
    <span
      className="dt-avatar dt-mono"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `oklch(78% 0.14 ${hue})`,
        boxShadow: ring ? `0 0 0 2px ${ring}` : 'none',
      }}
    >
      {initial}
    </span>
  );
};

export default Avatar;
