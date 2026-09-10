# Image asset workflow

Practical rules for preparing images for a new case study or updating an
existing one, so the site doesn't quietly re-accumulate the oversampling
problem fixed on 2026-09-10 (see the "Loading Performance" work in
project history — every image on the site was originally exported at
3–8× the resolution it's actually displayed at, which was the dominant
cause of slow loading).

This is a personal portfolio, not a production platform — these are
simple habits, not a build pipeline.

## The rule in one sentence

> Export from Figma at roughly **2× the image's actual CSS display
> width**, then run it through the conversion script below before
> dropping it into `assets/`.

## Step by step for a new image

1. **Find the image's real display width.** Check the CSS rule for the
   class it'll use (or the closest existing equivalent — e.g. a new
   case's hero mockup will likely reuse a pattern like
   `.case-hero__mockup` or `.atj2-hero__media`). Most content in this
   site's layout tops out around 1120–1280px (the page's own max
   content width), and most individual images inside a case study are
   well under that — a half-width hero image is usually 500–650px, a
   single body screenshot is usually 400–900px.
2. **Export at 2× that width**, not Figma's default full-canvas size.
   A 600px-wide display target needs roughly a 1200px export — not
   3000–4000px.
3. **Run it through `scripts/optimize_images.py`** (added 2026-09-10,
   see below) to resize (if still oversized) and convert to WebP.
4. **Add the `<img>` tag with `loading="lazy"`**, unless it's the one
   hero image at the very top of the page — see "Eager vs. lazy" below.
5. **Reference the `.webp` file directly** in the HTML — no `<picture>`
   fallback needed (WebP support is effectively universal; the project
   has no legacy-browser requirement).

## Format and quality — pick by content type, not by habit

| Content type | Format | Setting |
|---|---|---|
| Real photographs, photographic backgrounds, gradients | WebP | lossy, quality ≈ 80–85 |
| UI screenshots, dashboards, anything with on-screen text | WebP | **lossless** — lossy compression visibly softens small text |
| Mockups/device frames with real transparency (bezels, cutout portraits) | WebP | lossless if the transparent edge matters (e.g. a cutout portrait); lossy is fine for a mockup frame with only structural transparency, since WebP preserves alpha either way |
| Icons, logos, anything vector-shaped | SVG | n/a — never rasterize something that's already a clean vector |

When in doubt, use lossless. The resize step (going from a 4000px
export down to ~1200px) is where nearly all the size reduction comes
from — format and quality settings are secondary. Don't sacrifice
visible sharpness to chase a smaller number there.

## Eager vs. lazy

- **Eager (no `loading` attribute):** the nav logo, and the *one* hero
  image a visitor sees without scrolling. That's it.
- **Lazy (`loading="lazy"`):** everything else, including every image
  inside a case study's body, every mockup, every carousel slide not
  currently shown. The browser handles the timing automatically —
  nothing else to configure.

## Multiple sizes / `srcset`

Not used by default on this site, deliberately — see the 2026-09-10
performance investigation. Because almost nothing here is a true
full-bleed image that changes dramatically in size between mobile and
desktop (the content column caps around 1120–1280px everywhere), one
correctly-sized WebP file already serves both reasonably well. Only
reach for `srcset`/`<picture>` if a *future* case introduces a genuine
full-viewport hero image that's dramatically larger on desktop than on
mobile — most case studies won't need it.

## Reusing an asset across cases

If a new case needs an image that's visually identical to one already
used elsewhere on the site (a shared device-frame PNG, a repeated
icon), don't export a second copy under a new name — reference the
existing file's path directly. Two duplicate ~100KB "design system"
screenshots sitting under different case folders were found and fixed
on 2026-09-10 for exactly this reason.

## The conversion script

`scripts/optimize_images.py` — resizes to a target width (`--width`)
and saves a `.webp` next to the source (source file is left untouched,
so nothing is destructive). Uses Pillow, already available in this
project's Python environment; no new dependency to install.

```bash
python3 scripts/optimize_images.py path/to/image.png --width 1200 --lossless
python3 scripts/optimize_images.py path/to/photo.png --width 1200 --quality 82
```

Run it, then look at the result before committing — "quality-preserving"
is a visual judgment call the script can't fully make for you.
