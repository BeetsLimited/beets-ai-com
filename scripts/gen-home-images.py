#!/usr/bin/env python3
"""Generate / convert the beets-ai.com HOME page artwork.

Covers the site hero (16:9) and the eight card images (3 audiences, 5 themes).
Prompts live in scripts/home-prompts.json next to this file, so an image can be
regenerated rather than re-invented — the same discipline as scripts/gen-heroes.py
for the resource heroes.

Run with a Python 3.10+ interpreter (see the beets-ai-blog-images skill):

    PY=~/.local/share/uv/python/cpython-3.11.15-macos-aarch64-none/bin/python3
    $PY scripts/gen-home-images.py            # generate anything missing
    $PY scripts/gen-home-images.py --convert  # PNG -> WebP into public/images/

A name with `"scenes": [...]` is generated once per scene, staged as
/tmp/home-<name>.png, .c2.png, .c3.png; `"pick"` in the spec says which one to
ship, so a second run reproduces the chosen picture instead of silently picking
a different one.
"""
import json
import pathlib
import sys
import time

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parent
SPEC = json.loads((HERE / "home-prompts.json").read_text())
OUT = pathlib.Path("/tmp")

sys.path.insert(0, "/Users/beets3d/.hermes/skills/beets/beets-ai-blog-images/scripts")


def staged(name: str, candidate: int) -> pathlib.Path:
    """Where a generated PNG lives before it is chosen and converted."""
    return OUT / (f"home-{name}.png" if candidate == 1 else f"home-{name}.c{candidate}.png")


def scenes_of(spec) -> list[str]:
    """One entry per candidate: `scenes` (a real variant each) or one `scene`."""
    if isinstance(spec, dict):
        if "scenes" in spec:
            return list(spec["scenes"])
        return [spec["scene"]] * int(spec.get("candidates", 1))
    return [spec]


def generate_all() -> None:
    from dashscope_image import generate

    for name, spec in SPEC["images"].items():
        for candidate, scene in enumerate(scenes_of(spec), start=1):
            png = staged(name, candidate)
            if png.exists():
                print("skip (exists)", name, candidate, flush=True)
                continue
            try:
                generate(
                    SPEC["system"].format(scene=scene),
                    png,
                    model=SPEC["model"],
                    size=SPEC.get("size", SPEC["size"]),
                    n=1,
                    negative=SPEC["negative"],
                )
                print("OK", name, candidate, png.stat().st_size, flush=True)
            except Exception as error:  # noqa: BLE001 — report and continue
                print("FAIL", name, candidate, error, flush=True)
            time.sleep(3)  # the API rate-limits bursts of submissions


def convert_all() -> None:
    """Ship the chosen candidate of each image as WebP, at ~84 quality."""
    from PIL import Image

    target = REPO / "public" / "images"
    target.mkdir(parents=True, exist_ok=True)
    pick = SPEC.get("pick", {})
    for name in SPEC["images"]:
        chosen = int(pick.get(name, 1))
        png = staged(name, chosen)
        png = png if png.exists() else staged(name, 1)
        if not png.exists():
            print("missing", name)
            continue
        webp = target / f"{name}.webp"
        Image.open(png).convert("RGB").save(webp, "WEBP", quality=84, method=6)
        print(f"webp {name} <- {png.name}  {webp.stat().st_size:,} bytes "
              f"(png {png.stat().st_size:,})")


if __name__ == "__main__":
    convert_all() if "--convert" in sys.argv else generate_all()
