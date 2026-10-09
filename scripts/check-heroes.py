#!/usr/bin/env python3
"""Check a generated hero for the two things that fail silently.

1. **Baked-in text.** Diffusion models draw garbled lettering on any surface that
   looks like it should carry words, and a garbled string on a public education
   page is worse than no image. A single probe is not evidence — on 2026-10-10 the
   same image was reported "no text" by one question and "HOSPITAL on the laptop
   screen" by another. So each hero is asked twice, with different framing.

2. **The house style** — flat vector, faceless figures, deep red + royal blue,
   white space, nothing unsettling.

It also returns a one-line description of what is actually in the picture, which
is what `imageAlt` must describe.

    ~/.local/share/uv/python/cpython-3.11.15-macos-aarch64-none/bin/python3 \\
        scripts/check-heroes.py /tmp/hero-*.png
    ... /tmp/hero-*.png            # or the shipped WebP under public/images/
"""
import json
import subprocess
import sys
from pathlib import Path

VISION = "/Users/beets3d/.hermes/skills/beets/beets-ai-blog-images/scripts/dashscope_vision.py"
PY = "/Users/beets3d/.local/share/uv/python/cpython-3.11.15-macos-aarch64-none/bin/python3"

TEXT_Q = (
    "Carefully scan every surface for written characters, digits, letters, logos or "
    "signage, including very small ones. Reply with the exact text you can read, or "
    "'none' if there is none. Then, on a second line, describe in one sentence exactly "
    "what the image depicts — how many people, what they are doing, and the main objects "
    "and their colours — so it can be used as alt text."
)
STYLE_Q = (
    "Answer briefly: is this flat vector editorial illustration (not photorealistic or 3D)? "
    "Are there deep red and royal blue accents? Is there generous white space? Are any human "
    "figures simple and faceless? Anything unsettling for a school audience?"
)


def ask(image: Path, question: str) -> str:
    result = subprocess.run(
        [PY, VISION, str(image), question], capture_output=True, text=True, timeout=180
    )
    out = result.stdout.strip().splitlines()
    return "\n".join(line for line in out if line.strip() and not line.startswith("[usage"))


def main() -> int:
    flagged = []
    for path in [Path(p) for p in sys.argv[1:]]:
        if not path.exists():
            print(f"MISSING {path}")
            continue
        text = ask(path, TEXT_Q)
        style = ask(path, STYLE_Q)
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        verdict = lines[0] if lines else "(no answer)"
        scene = lines[1] if len(lines) > 1 else ""
        clean = verdict.lower().startswith(("none", "no ", "there is no"))
        if not clean:
            flagged.append(path.name)
        print(f"\n=== {path.name}  {'CLEAN' if clean else 'FLAGGED'}")
        print(f"    text : {verdict}")
        print(f"    scene: {scene}")
        print(f"    style: {' | '.join(l.strip() for l in style.splitlines() if l.strip())}")

    print("\n" + ("=" * 60))
    if flagged:
        print(f"⚠️  {len(flagged)} need a look: {', '.join(flagged)}")
        return 1
    print("no rendered text reported in any hero")
    return 0


if __name__ == "__main__":
    sys.exit(main())
