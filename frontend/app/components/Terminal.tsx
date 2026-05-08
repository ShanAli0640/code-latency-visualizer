"use client";

import { useEffect, useRef, useState } from "react";
import { runCommand, type RunResult } from "../api";

type Line = { prompt: string; command: string; result?: RunResult };

type Props = {
  onResult: (result: RunResult, source: string) => void;
};

export default function Terminal({ onResult }: Props) {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, busy]);

  async function submit() {
    const command = input.trim();
    if (!command || busy) return;
    setInput("");
    setBusy(true);
    const line: Line = { prompt: "$", command };
    setLines((prev) => [...prev, line]);
    try {
      const result = await runCommand(command);
      setLines((prev) =>
        prev.map((l, i) => (i === prev.length - 1 ? { ...l, result } : l))
      );
      onResult(result, `$ ${command}`);
    } catch (err) {
      const result: RunResult = {
        stdout: "",
        stderr: String(err),
        returncode: -1,
        duration_ms: 0,
      };
      setLines((prev) =>
        prev.map((l, i) => (i === prev.length - 1 ? { ...l, result } : l))
      );
      onResult(result, `$ ${command}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="terminal" ref={scrollRef}>
      {lines.map((line, i) => (
        <div key={i} className="term-line">
          <div>
            <span className="term-prompt">{line.prompt}</span> {line.command}
          </div>
          {line.result && (
            <>
              {line.result.stdout && <pre>{line.result.stdout}</pre>}
              {line.result.stderr && (
                <pre className="term-err">{line.result.stderr}</pre>
              )}
            </>
          )}
        </div>
      ))}
      <div className="term-input-row">
        <span className="term-prompt">$</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          disabled={busy}
          spellCheck={false}
          autoFocus
        />
      </div>
    </div>
  );
}
