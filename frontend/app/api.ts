export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type RunResult = {
  stdout: string;
  stderr: string;
  returncode: number;
  duration_ms: number;
};

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const runCode = (code: string) =>
  post<RunResult>("/api/run-code", { code });

export const runCommand = (command: string) =>
  post<RunResult>("/api/run-command", { command });
