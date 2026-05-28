interface Props {
  code: string;
  fontSize?: number;
}

const CodePreview = ({ code, fontSize = 16 }: Props) => (
  <div className="dt-code-area" style={{ fontSize, padding: '16px 20px', color: 'var(--dt-type-pending)' }}>
    {code}
  </div>
);

export default CodePreview;
