interface Props {
  handle: string;
  hue?: number;
  size?: number;
  ring?: string;
  src?: string | null;
}

const Avatar = ({ hue = 170, size = 32, ring, src }: Props) => (
  <span
    className="dt-avatar"
    style={{
      width: size,
      height: size,
      overflow: 'hidden',
      background: `oklch(78% 0.14 ${hue})`,
      boxShadow: ring ? `0 0 0 2px ${ring}` : 'none',
    }}
  >
    {src && <img src={src} alt="" className="w-full h-full object-cover block" />}
  </span>
);

export default Avatar;
