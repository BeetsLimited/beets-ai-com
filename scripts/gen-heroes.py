#!/usr/bin/env python3
"""Generate the hero images for the beets-ai.com resource pages.

Prompts live in scripts/hero-prompts.json next to this file, so a hero can be
regenerated rather than re-invented. Run with a Python 3.10+ interpreter and
Pillow available for the WebP step (see the beets-ai-blog-images skill):

    ~/.local/share/uv/python/cpython-3.11.15-macos-aarch64-none/bin/python3 \
        scripts/gen-heroes.py            # generate any that are missing

    node scripts/gen-heroes.py --convert # PNG -> WebP into public/images/
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


def convert_all() -> None:
    from PIL import Image

    target = REPO / "public" / "images"
    target.mkdir(parents=True, exist_ok=True)
    for address in SPEC["prompts"]:
        png = OUT / f"hero-{address}.png"
        if not png.exists():
            print("missing", address)
            continue
        webp = target / f"{address}-hero.webp"
        Image.open(png).convert("RGB").save(webp, "WEBP", quality=84, method=6)
        print(f"webp {address} {webp.stat().st_size:,} bytes (png {png.stat().st_size:,})")


if __name__ == "__main__":
    convert_all() if "--convert" in sys.argv else generate_all()
