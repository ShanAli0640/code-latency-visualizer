"use client";

import { useState } from "react";
import Editor from "./components/Editor";
import Terminal from "./components/Terminal";
import { runCode, type RunResult } from "./api";

const STARTER = `def greet(name: str) -> str:
    return f"hello, {name}"


print(greet("world"))
`;

export default function Home() {
  const [code, setCode] = useState(STARTER);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [debug, setDebug] = useState<RunResult | null>(null);
  const [debugSource, setDebugSource] = useState("");

  async function handleRun() {
    if (running) return;
    setRunning(true);
    try {
      const result = await runCode(code);
      const text =
        (result.stdout || "") + (result.stderr ? `\n${result.stderr}` : "");
      setOutput(text || "(no output)");
      setDebug(result);
      setDebugSource("python script");
    } catch (err) {
      setOutput(String(err));
      setDebug(null);
      setDebugSource("python script");
    } finally {
      setRunning(false);
    }
  }

  function handleTerminalResult(result: RunResult, source: string) {
    const text =
      (result.stdout || "") + (result.stderr ? `\n${result.stderr}` : "");
    setOutput(text || "(no output)");
    setDebug(result);
    setDebugSource(source);
  }

  return (
    <main className="layout">
      <section className="pane editor-pane">
        <header className="pane-head">
          <span>main.py</span>
          <button onClick={handleRun} disabled={running}>
            {running ? "running…" : "Run"}
          </button>
        </header>
        <div className="pane-body editor-body">
          <Editor value={code} onChange={setCode} />
        </div>
      </section>

      <section className="pane terminal-pane">
        <header className="pane-head">
          <span>terminal</span>
        </header>
        <div className="pane-body">
          <Terminal onResult={handleTerminalResult} />
        </div>
      </section>

      <section className="pane output-pane">
        <header className="pane-head">
          <span>output</span>
        </header>
        <pre className="pane-body output">{output || "—"}</pre>
      </section>

      <section className="pane debug-pane">
        <header className="pane-head">
          <span>debug</span>
        </header>
        <div className="pane-body debug">
          {debug ? (
            <dl>
              <dt>source</dt>
              <dd>{debugSource}</dd>
              <dt>exit code</dt>
              <dd>{debug.returncode}</dd>
              <dt>duration</dt>
              <dd>{debug.duration_ms} ms</dd>
              <dt>stderr</dt>
              <dd>
                <pre>{debug.stderr || "—"}</pre>
              </dd>
            </dl>
          ) : (
            "—"
          )}
        </div>
      </section>
    </main>
  );
}
