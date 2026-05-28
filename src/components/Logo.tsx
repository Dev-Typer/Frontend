interface Props {
  size?: number;
}

const Logo = ({ size = 16 }: Props) => (
  <span className="dt-logo" style={{ fontSize: size, gap: size * 0.5 }}>
    <img
      src="/assets/logo.png"
      alt=""
      width={size * 2.2}
      height={size * 2.2}
      style={{ display: 'block', flexShrink: 0, margin: `-${size * 0.5}px 0` }}
    />
    DevTyper
  </span>
);

export default Logo;
