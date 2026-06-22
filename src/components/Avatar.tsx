const AVATAR_POOL = [
  '/assets/av/a1.png', '/assets/av/a2.png', '/assets/av/a3.png', '/assets/av/a4.png',
  '/assets/av/a5.png', '/assets/av/a6.png', '/assets/av/a7.png', '/assets/av/a8.png',
];

function avatarFor(handle: string): string {
  let h = 0;
  const s = String(handle || '?');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_POOL[h % AVATAR_POOL.length];
}

interface Props {
  handle: string;
  hue?: number;
  size?: number;
  ring?: string;
}

const Avatar = ({ handle, hue = 170, size = 32, ring }: Props) => {
  const src = avatarFor(handle);
  return (
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
      <img src={src} alt="" className="w-full h-full object-cover block" />
    </span>
  );
};

export default Avatar;
