"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="loading">loading editor…</div>,
});

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function Editor({ value, onChange }: Props) {
  return (
    <MonacoEditor
      height="100%"
      language="python"
      theme="vs-dark"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      options={{
        fontSize: 13,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
      }}
    />
  );
}
