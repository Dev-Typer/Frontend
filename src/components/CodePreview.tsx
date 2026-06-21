interface Props {
  code: string;
  fontSize?: number;
}

const CodePreview = ({ code, fontSize = 16 }: Props) => (
  <div className="dt-code-area px-5 py-4 text-dt-type-pending" style={{ fontSize }}>
    {code}
  </div>
);

export default CodePreview;
