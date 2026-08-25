"""
Render the S-OS specification to PDF.

    python3 tools/docs/build_spec.py

The specification is declared as a document in the S-OS filesystem, and until
now had no file behind it — Explorer showed the entry as unavailable, which is
honest but not useful. This turns `docs/S-OS-SPEC.md` into the PDF that entry
points at.

Markdown is the source of truth and stays that way: the document is edited as
text, reviewed in diffs, and rendered on demand. Nothing here is hand-authored,
so the PDF can never drift from the specification it claims to be.

Requires pandoc and xelatex. Both are dev-machine tools rather than build
dependencies — the PDF is committed, so a deploy never needs either.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SOURCE = os.path.join(ROOT, "docs", "S-OS-SPEC.md")
OUTPUT = os.path.join(ROOT, "public", "documents", "s-os-specification.pdf")

# Accent taken from src/styles/tokens.css — the deep end of the brand ramp,
# which is the only one legible as ink on white.
ACCENT = "1A86D6"
INK = "15202B"

ARGS = [
    "--from=markdown+pipe_tables+backtick_code_blocks+strikeout",
    "--pdf-engine=xelatex",
    "--toc",
    "--toc-depth=2",
    # Not --number-sections: the specification numbers its own sections, and
    # letting pandoc add another set produced "1.1 1. Requirements summary".
    "-V", "documentclass=article",
    "-V", "papersize=a4",
    "-V", "geometry:margin=22mm",
    "-V", "fontsize=10pt",
    # Inter and JetBrains Mono are not installed system-wide in every
    # environment, and a missing font is a hard xelatex failure rather than a
    # substitution. The defaults are close enough for a specification.
    "-V", f"linkcolor={ACCENT}",
    "-V", f"urlcolor={ACCENT}",
    # toccolor takes a named colour, not a hex triple, unlike link and url
    # which pandoc passes through xcolor's HTML model.
    "-V", "toccolor=black",
    "-V", "colorlinks=true",
    "-V", "title=S-OS — Product Specification",
    "-V", "author=Seedorf Obeng-Mireku",
]


def main() -> None:
    if not shutil.which("pandoc"):
        sys.exit("pandoc is not installed. `brew install pandoc` on macOS.")
    if not shutil.which("xelatex"):
        sys.exit("xelatex is not installed. Install a TeX distribution, or MacTeX on macOS.")
    if not os.path.exists(SOURCE):
        sys.exit(f"missing source: {SOURCE}")

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

    result = subprocess.run(
        ["pandoc", SOURCE, *ARGS, "-o", OUTPUT],
        capture_output=True,
        text=True,
        cwd=ROOT,
    )

    if result.returncode != 0:
        sys.stderr.write(result.stderr)
        sys.exit(result.returncode)

    print(f"{OUTPUT}  {os.path.getsize(OUTPUT):,} bytes")


if __name__ == "__main__":
    main()
