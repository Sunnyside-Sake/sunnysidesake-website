"""
Cut a bottle out of its background, producing a transparent PNG.

Usage:  .venv-imgtools/bin/python scripts/cutout.py <source-image> <dest.png>

Uses U2Net segmentation (rembg) rather than colour-distance flood fill. Flood
fill was tried first and is not good enough on this library: the backgrounds
carry shadows and a wall/counter transition, so any single tolerance either
leaves ragged patches of wall attached or eats into the bottle.

WHAT THIS CAN AND CANNOT DO
  Plain background, one bottle    -> excellent, indistinguishable from a
                                    professionally masked cutout
  Busy scene (bar shelf, table)   -> fails. U2Net finds "the salient subject",
                                    which in a bar shot is the whole shelf, and
                                    on a restaurant table is the bottle plus the
                                    sauce dish next to it.

So this is not a rescue for existing photography. It is the processing half of
a reshoot: photograph each bottle alone against a plain wall, run this, and the
cutouts come out consistent for free.

Orientation is handled with sharp-equivalent logic: phone shots are stored
landscape with no EXIF orientation tag, so anything wider than it is tall gets
rotated 90 degrees clockwise.
"""

import subprocess
import sys
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

MAX_EDGE = 2000


def load_upright(src: Path) -> Image.Image:
    """Convert (HEIC included) and stand the bottle up."""
    tmp = Path("/tmp/_cutout_in.jpg")
    subprocess.run(
        ["sips", "-s", "format", "jpeg", str(src), "--out", str(tmp)],
        capture_output=True,
        check=True,
    )
    im = Image.open(tmp)
    # Phone shots are stored landscape with no orientation tag; ROTATE_270 in
    # PIL is a 90-degree clockwise turn, matching what the site's other image
    # processing does.
    if im.width > im.height:
        im = im.transpose(Image.ROTATE_270)
    im.thumbnail((MAX_EDGE, MAX_EDGE))
    return im.convert("RGB")


def cutout(src: Path, dest: Path) -> None:
    im = load_upright(src)
    session = new_session("u2net")
    # alpha matting gives a softer, more accurate edge on glass, which has a
    # partly transparent boundary that a binary mask renders as a hard jag
    out = remove(
        im,
        session=session,
        post_process_mask=True,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=15,
        alpha_matting_erode_size=8,
    )
    # rembg returns the image transposed — a (1500, 2000) input comes back as
    # (2000, 1500). Undo that before cropping, or every bottle ends up lying
    # on its side.
    if (out.width, out.height) == (im.height, im.width):
        out = out.transpose(Image.ROTATE_90)

    # trim fully transparent margin so every bottle is framed consistently
    out = out.crop(out.getbbox())
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest)

    alpha = out.split()[-1].tobytes()
    clear = sum(1 for v in alpha if v < 20)
    soft = sum(1 for v in alpha if 20 <= v <= 235)
    print(f"{dest}  {out.size[0]}x{out.size[1]}")
    print(
        f"  transparent {100 * clear / len(alpha):.1f}%   "
        f"soft edge {100 * soft / len(alpha):.1f}%"
    )


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    cutout(Path(sys.argv[1]), Path(sys.argv[2]))
