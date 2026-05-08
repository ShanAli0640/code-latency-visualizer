import subprocess
import sys
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TIMEOUT_SECONDS = 30


class CodeRequest(BaseModel):
    code: str


class CommandRequest(BaseModel):
    command: str


def _result(stdout: str, stderr: str, returncode: int, started: float) -> dict:
    return {
        "stdout": stdout,
        "stderr": stderr,
        "returncode": returncode,
        "duration_ms": int((time.perf_counter() - started) * 1000),
    }


@app.get("/")
def root():
    return {"status": "ok"}


@app.post("/api/run-code")
def run_code(req: CodeRequest):
    started = time.perf_counter()
    try:
        proc = subprocess.run(
            [sys.executable, "-c", req.code],
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
        )
        return _result(proc.stdout, proc.stderr, proc.returncode, started)
    except subprocess.TimeoutExpired:
        return _result("", f"timed out after {TIMEOUT_SECONDS}s", -1, started)


@app.post("/api/run-command")
def run_command(req: CommandRequest):
    started = time.perf_counter()
    try:
        proc = subprocess.run(
            req.command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
        )
        return _result(proc.stdout, proc.stderr, proc.returncode, started)
    except subprocess.TimeoutExpired:
        return _result("", f"timed out after {TIMEOUT_SECONDS}s", -1, started)
