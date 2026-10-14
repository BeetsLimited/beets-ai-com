#!/usr/bin/env python3
"""Generate the hero images for the beets-ai.com resource pages.

Prompts live in scripts/hero-prompts.json next to this file, so a hero can be
regenerated rather than re-invented. Run with a Python 3.10+ interpreter and
Pillow available for the WebP step (see the beets-ai-blog-images skill):

    ~/.local/share/uv/python/cpython-3.11.15-macos-aarch64-none/bin/python3 \
        scripts/gen-heroes.py            # generate any that are missing

    ~/.venvs/office/bin/python3 scripts/gen-heroes.py --convert                  # ALL prompts
    ~/.venvs/office/bin/python3 scripts/gen-heroes.py --convert <address> [...]  # only these

PASS THE ADDRESSES. `--convert` with no arguments rewrites every file named in
hero-prompts.json from whatever happens to be in /tmp — and a /tmp PNG left by an
earlier session is a DIFFERENT GENERATION of that hero, not a re-compression. On
2026-10-15 that silently re-encoded 14 live heroes, one of them 40% smaller than the
image it replaced. Only convert what you generated:

    git status --porcelain public/images        # then restore everything you did not add
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parent
SPEC = json.loads((HERE / "hero-prompts.json").read_text())
OUT = pathlib.Path("/tmp")

sys.path.insert(0, "/Users/beets3d/.hermes/skills/beets/beets-ai-blog-images/scripts")


def generate_all() -> None:
    from dashscope_image import generate

    for address, scene in SPEC["prompts"].items():
        png = OUT / f"hero-{address}.png"
        if png.exists():
            print("skip (exists)", address, flush=True)
            continue
        prompt = SPEC["system"].format(scene=scene)
        try:
            generate(
                prompt,
                png,
                model=SPEC["model"],
                size=SPEC["size"],
                n=1,
                negative=SPEC["negative"],
            )
            print("OK", address, png.stat().st_size, flush=True)
        except Exception as error:  # noqa: BLE001 — report and continue
            print("FAIL", address, error, flush=True)


def convert_all(only: list[str] | None = None) -> None:
    from PIL import Image

    target = REPO / "public" / "images"
    target.mkdir(parents=True, exist_ok=True)
    # `only` is the guard: an unnamed address is left ALONE, because its /tmp PNG may be a
    # different generation of the hero rather than the one that is live.
    if only is not None:
        unknown = [a for a in only if a not in SPEC["prompts"]]
        if unknown:
            raise SystemExit(f"not in hero-prompts.json: {', '.join(unknown)}")
    for address in SPEC["prompts"]:
        if only is not None and address not in only:
            continue
        png = OUT / f"hero-{address}.png"
        if not png.exists():
            print("missing", address)
            continue
        webp = target / f"{address}-hero.webp"
        Image.open(png).convert("RGB").save(webp, "WEBP", quality=84, method=6)
        print(f"webp {address} {webp.stat().st_size:,} bytes (png {png.stat().st_size:,})")


if __name__ == "__main__":
    if "--convert" in sys.argv:
        # Addresses after --convert restrict the pass; no addresses means all of them,
        # which is only right when every prompt was just regenerated.
        convert_all([a for a in sys.argv[1:] if a != "--convert"] or None)
    else:
        generate_all()
