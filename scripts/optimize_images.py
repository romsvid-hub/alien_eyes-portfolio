#!/usr/bin/env python3
"""
Resize an image to a target display width and save it as WebP.

Never overwrites or modifies the source file — writes a sibling .webp
file next to it. See docs/Image_Asset_Workflow.md for when to use
--lossless vs --quality.

Usage:
    python3 scripts/optimize_images.py path/to/image.png --width 1200 --lossless
    python3 scripts/optimize_images.py path/to/photo.png --width 1200 --quality 82

Requires Pillow (already available in this project's Python environment
as of 2026-09-10 — no install needed).
"""
import argparse
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required (pip install Pillow) — it should already be "
              "available in this project's environment; if not, that's a real "
              "install, not a silent fallback.")


def optimize(src_path, target_width, lossless, quality):
    if not os.path.exists(src_path):
        sys.exit(f"File not found: {src_path}")

    with Image.open(src_path) as im:
        im.load()
        w, h = im.size

        if target_width and target_width < w:
            new_h = round(h * (target_width / w))
            im = im.resize((target_width, new_h), Image.LANCZOS)
            resized_note = f"{w}x{h} -> {target_width}x{new_h}"
        else:
            resized_note = f"{w}x{h} (not upscaled; already <= target width)"

        if im.mode == 'P':
            im = im.convert('RGBA' if 'transparency' in im.info else 'RGB')
        elif im.mode not in ('RGB', 'RGBA', 'L', 'LA'):
            im = im.convert('RGBA' if im.mode.endswith('A') else 'RGB')

        webp_path = os.path.splitext(src_path)[0] + '.webp'
        if lossless:
            im.save(webp_path, 'WEBP', lossless=True, method=6)
        else:
            im.save(webp_path, 'WEBP', quality=quality, method=6)

    before = os.path.getsize(src_path)
    after = os.path.getsize(webp_path)
    pct = (1 - after / before) * 100 if before else 0
    print(f"{src_path}")
    print(f"  {resized_note}")
    print(f"  {before/1024:,.0f} KB -> {after/1024:,.0f} KB  ({pct:.0f}% smaller)")
    print(f"  -> {webp_path}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('image', help='Path to the source PNG/JPG')
    p.add_argument('--width', type=int, default=None,
                    help='Target pixel width (omit to convert format only, no resize)')
    mode = p.add_mutually_exclusive_group(required=True)
    mode.add_argument('--lossless', action='store_true',
                       help='Use for UI/screenshots/text/transparency-sensitive content')
    mode.add_argument('--quality', type=int, metavar='N',
                       help='Lossy quality 1-100 (use ~80-85) — for real photos/gradients only')
    args = p.parse_args()
    optimize(args.image, args.width, args.lossless, args.quality)


if __name__ == '__main__':
    main()
