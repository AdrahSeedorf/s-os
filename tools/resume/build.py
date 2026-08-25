"""
Resume renderer — two PDFs from one source of truth.

    python3 tools/resume/build.py

Outputs into public/documents/:

  seedorf-obeng-mireku-resume.pdf       S-OS-branded, for the portfolio and
                                        for sending directly to a person
  seedorf-obeng-mireku-resume-ats.pdf   plain single column, for the upload
                                        box on an application form

Why two. A resume has two readers with opposite requirements. A person
responds to a document that looks considered and matches the portfolio it came
from; an applicant tracking system reads the text layer and mangles anything
with columns, sidebars, tables or text baked into images. Trying to satisfy
both in one file produces a document that is neither well designed nor
reliably parsed, so this renders the same words twice.

Both are real text — no rasterisation anywhere, so both are searchable,
selectable and machine-readable. The branded version keeps a white body on a
white page and confines colour to rules and headings, because a recruiter who
prints a full-bleed dark A4 gets a grey smear and an empty toner cartridge.
"""

from __future__ import annotations

import os
import sys

from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import content as C  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT_DIR = os.path.join(ROOT, "public", "documents")
FONT_DIR = os.environ.get("RESUME_FONT_DIR", os.path.join(HERE, "fonts"))

PAGE_W, PAGE_H = A4

# --- Palette -------------------------------------------------------------
# Taken from src/styles/tokens.css. The deep accent is the shadow end of the
# S-OS mark; on white it is the one colour that ties the page to the desktop.
ACCENT_DEEP = HexColor("#1a86d6")
ACCENT_INK = HexColor("#0e4f80")
BRAND_DARK = HexColor("#0a0d14")
TEXT = HexColor("#15202b")
MUTED = HexColor("#5b6b7a")
RULE = Color(0.80, 0.85, 0.89)


def register_fonts() -> tuple[str, str, str]:
    """Inter if the converted files are present, Helvetica otherwise.

    The ATS build deliberately does not depend on this: a core font is the
    safest possible thing to hand a parser, and Helvetica is one of the
    fourteen every reader has.
    """
    try:
        for name in ("Inter-Regular", "Inter-Medium", "Inter-SemiBold", "Inter-Bold"):
            pdfmetrics.registerFont(TTFont(name, os.path.join(FONT_DIR, f"{name}.ttf")))
        return "Inter-Regular", "Inter-SemiBold", "Inter-Bold"
    except Exception:
        return "Helvetica", "Helvetica-Bold", "Helvetica-Bold"


class Sheet:
    """A page with a cursor, and the small amount of layout this needs.

    Deliberately not Platypus flowables: the document is one column of short
    blocks, and a cursor plus a widow check is less machinery than a frame
    system for the same result — and it makes "keep this heading with its
    first bullet" a two-line rule rather than a custom flowable.
    """

    def __init__(self, path: str, *, branded: bool, fonts: tuple[str, str, str]):
        self.c = canvas.Canvas(path, pagesize=A4)
        self.branded = branded
        self.regular, self.semibold, self.bold = fonts
        self.margin = 16 * mm if branded else 18 * mm
        self.right = PAGE_W - self.margin
        self.width = self.right - self.margin
        self.y = PAGE_H - self.margin

        self.c.setTitle(f"{C.NAME} — Resume")
        self.c.setAuthor(C.NAME)
        self.c.setSubject(C.TITLE)
        self.c.setKeywords(
            "software engineer, TypeScript, C++, Java, Next.js, PostgreSQL, resume"
        )

    # -- primitives -------------------------------------------------------
    def space(self, amount: float) -> None:
        self.y -= amount

    def need(self, amount: float) -> None:
        """Break the page if `amount` will not fit. Keeps headings with their
        content, which is the only pagination rule this document needs."""
        if self.y - amount < self.margin:
            self.page_break()

    def page_break(self) -> None:
        self.c.showPage()
        self.y = PAGE_H - self.margin

    def wrap(self, text: str, font: str, size: float, width: float) -> list[str]:
        words, lines, line = text.split(), [], ""
        for word in words:
            trial = f"{line} {word}".strip()
            if self.c.stringWidth(trial, font, size) <= width:
                line = trial
            else:
                if line:
                    lines.append(line)
                line = word
        if line:
            lines.append(line)
        return lines

    def para(
        self,
        text: str,
        *,
        font: str | None = None,
        size: float = 9.1,
        leading: float = 12.6,
        colour: Color = TEXT,
        indent: float = 0.0,
    ) -> None:
        font = font or self.regular
        self.c.setFillColor(colour)
        self.c.setFont(font, size)
        for line in self.wrap(text, font, size, self.width - indent):
            self.need(leading)
            self.c.drawString(self.margin + indent, self.y - size, line)
            self.y -= leading

    def bullet(self, text: str) -> None:
        size, leading, indent = 9.1, 12.4, 9.5
        lines = self.wrap(text, self.regular, size, self.width - indent)
        self.need(leading * min(len(lines), 2))
        self.c.setFillColor(ACCENT_DEEP if self.branded else TEXT)
        self.c.setFont(self.regular, size)
        # Helvetica's bullet extracts as an unmapped glyph, which reaches a
        # parser as "(cid:127)" and turns every achievement into noise. The
        # plain build uses a hyphen, which every encoding agrees about.
        self.c.drawString(self.margin + 1.5, self.y - size, "\u2022" if self.branded else "-")
        self.c.setFillColor(TEXT)
        for line in lines:
            self.need(leading)
            self.c.drawString(self.margin + indent, self.y - size, line)
            self.y -= leading

    def section(self, label: str) -> None:
        """A section heading. Plain words on their own line — an ATS looks for
        EDUCATION and PROJECTS as literal text, so neither build hides them
        inside a graphic or a table."""
        self.space(6.5 if self.branded else 5)
        self.need(20)
        size = 8.4
        self.c.setFont(self.semibold, size)
        self.c.setFillColor(ACCENT_INK if self.branded else TEXT)
        self.c.drawString(self.margin, self.y - size, label.upper())
        if self.branded:
            text_w = self.c.stringWidth(label.upper(), self.semibold, size)
            self.c.setStrokeColor(RULE)
            self.c.setLineWidth(0.6)
            self.c.line(
                self.margin + text_w + 6, self.y - size + 2.6, self.right, self.y - size + 2.6
            )
        self.y -= size + 6.5

    def save(self) -> None:
        self.c.save()


def draw_mark(c: canvas.Canvas, x: float, y: float, size: float) -> None:
    """The S-OS mark, on the same 100-unit grid as SosMark.tsx.

    Redrawn here rather than embedded as an image so it stays vector, prints
    sharply and adds nothing to the file size.
    """
    # `y` is the bottom edge of the mark: the negative y-scale below flips the
    # SVG's top-down grid, so mark-space y=100 lands on the y passed in.
    c.saveState()
    c.translate(x, y)
    c.scale(size / 100.0, -size / 100.0)
    c.translate(0, -100)

    c.setFillColor(ACCENT_DEEP)
    c.roundRect(6, 6, 88, 88, 20, stroke=0, fill=1)

    path = c.beginPath()
    path.moveTo(66, 36)
    path.curveTo(62, 25, 36, 24, 35, 37)
    path.curveTo(34, 50, 65, 47, 64, 60)
    path.curveTo(63, 73, 38, 74, 33, 65)
    c.setStrokeColor(HexColor("#e4faff"))
    c.setLineWidth(9)
    c.setLineCap(1)
    c.drawPath(path, stroke=1, fill=0)
    c.restoreState()


def header_branded(s: Sheet) -> None:
    c = s.c
    band = 30 * mm
    c.setFillColor(BRAND_DARK)
    c.rect(0, PAGE_H - band, PAGE_W, band, stroke=0, fill=1)
    c.setFillColor(ACCENT_DEEP)
    c.rect(0, PAGE_H - band - 1.6, PAGE_W, 1.6, stroke=0, fill=1)

    mark = 13 * mm
    draw_mark(c, s.margin, PAGE_H - band + (band - mark) / 2, mark)

    left = s.margin + mark + 6 * mm
    top = PAGE_H - band + band - 9.5 * mm

    c.setFont(s.bold, 19)
    c.setFillColor(HexColor("#ffffff"))
    c.drawString(left, top, C.NAME)

    c.setFont(s.regular, 9.4)
    c.setFillColor(HexColor("#8ef1ff"))
    c.drawString(left, top - 13.5, f"{C.TITLE}  ·  {C.LOCATION}")

    # Contact details as one line of real text with live links over it.
    c.setFont(s.regular, 8.5)
    c.setFillColor(Color(1, 1, 1, alpha=0.82))
    x = left
    y = top - 27
    for i, (_, shown, url) in enumerate(C.CONTACT):
        if i:
            sep = "   ·   "
            c.drawString(x, y, sep)
            x += c.stringWidth(sep, s.regular, 8.5)
        c.drawString(x, y, shown)
        w = c.stringWidth(shown, s.regular, 8.5)
        c.linkURL(url, (x, y - 2, x + w, y + 9), relative=0, thickness=0)
        x += w

    s.y = PAGE_H - band - 9 * mm


def header_plain(s: Sheet) -> None:
    """No graphics, no colour, no columns. Name, then contact details as one
    plain line — the shape every parser was written against."""
    c = s.c
    c.setFont(s.bold, 17)
    c.setFillColor(TEXT)
    c.drawString(s.margin, s.y - 17, C.NAME)
    s.y -= 24

    c.setFont(s.regular, 9.6)
    c.drawString(s.margin, s.y - 10, f"{C.TITLE} | {C.LOCATION}")
    s.y -= 15

    line = " | ".join(shown for _, shown, _ in C.CONTACT)
    c.setFont(s.regular, 9.2)
    c.drawString(s.margin, s.y - 10, line)
    s.y -= 17

    c.setStrokeColor(RULE)
    c.setLineWidth(0.7)
    c.line(s.margin, s.y, s.right, s.y)
    s.y -= 9


def body(s: Sheet) -> None:
    s.section("Summary")
    s.para(C.SUMMARY, colour=TEXT)

    s.section("Education")
    for entry in C.EDUCATION:
        s.need(26)
        c = s.c
        c.setFont(s.semibold, 9.8)
        c.setFillColor(TEXT)
        c.drawString(s.margin, s.y - 9.8, entry["institution"])
        c.setFont(s.regular, 8.8)
        c.setFillColor(MUTED)
        c.drawRightString(s.right, s.y - 9.8, entry["dates"])
        s.y -= 13.5
        s.para(f"{entry['qualification']}, {entry['location']}", size=9.0, colour=TEXT)
        for point in entry["points"]:
            s.bullet(point)
        s.space(3.5)

    s.section("Projects")
    for i, project in enumerate(C.PROJECTS):
        # Keep a project title with at least its stack line and first bullet.
        s.need(40)
        c = s.c
        c.setFont(s.semibold, 9.9)
        c.setFillColor(TEXT)
        c.drawString(s.margin, s.y - 9.9, project["name"])

        c.setFont(s.regular, 8.4)
        c.setFillColor(ACCENT_INK if s.branded else MUTED)
        c.drawRightString(s.right, s.y - 9.6, project["link"])
        # Not every project has a URL. The capstone was delivered to a sponsor
        # and is not published, so its right-hand note says so in plain words
        # rather than pretending to be a link that goes nowhere.
        if project["url"]:
            w = c.stringWidth(project["link"], s.regular, 8.4)
            c.linkURL(
                project["url"],
                (s.right - w, s.y - 12, s.right, s.y - 5),
                relative=0,
                thickness=0,
            )
        s.y -= 13

        s.para(project["stack"], size=8.5, leading=11.4, colour=MUTED)
        s.space(1.5)
        for point in project["points"]:
            s.bullet(point)
        if i != len(C.PROJECTS) - 1:
            s.space(5)

    s.section("Skills")
    for label, values in C.SKILLS:
        s.need(13)
        c = s.c
        label_font_size = 9.0
        c.setFont(s.semibold, label_font_size)
        c.setFillColor(TEXT)
        heading = f"{label}: "
        c.drawString(s.margin, s.y - label_font_size, heading)
        indent = c.stringWidth(heading, s.semibold, label_font_size)

        c.setFont(s.regular, 9.0)
        lines = s.wrap(values, s.regular, 9.0, s.width - indent)
        for j, line in enumerate(lines):
            if j:
                s.need(11.8)
            c.setFont(s.regular, 9.0)
            c.setFillColor(TEXT)
            c.drawString(s.margin + (indent if j == 0 else indent), s.y - 9.0, line)
            s.y -= 11.8

    s.section("Additional")
    for label, values in C.ADDITIONAL:
        s.need(12)
        c = s.c
        c.setFont(s.semibold, 9.0)
        c.setFillColor(TEXT)
        heading = f"{label}: "
        c.drawString(s.margin, s.y - 9.0, heading)
        indent = c.stringWidth(heading, s.semibold, 9.0)
        c.setFont(s.regular, 9.0)
        for j, line in enumerate(s.wrap(values, s.regular, 9.0, s.width - indent)):
            if j:
                s.need(11.6)
            c.drawString(s.margin + indent, s.y - 9.0, line)
            s.y -= 11.6


def build(path: str, *, branded: bool) -> str:
    fonts = register_fonts() if branded else ("Helvetica", "Helvetica-Bold", "Helvetica-Bold")
    s = Sheet(path, branded=branded, fonts=fonts)
    (header_branded if branded else header_plain)(s)
    body(s)
    s.save()
    return path


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    for filename, branded in (
        ("seedorf-obeng-mireku-resume.pdf", True),
        ("seedorf-obeng-mireku-resume-ats.pdf", False),
    ):
        out = os.path.join(OUT_DIR, filename)
        build(out, branded=branded)
        print(f"{out}  {os.path.getsize(out):,} bytes")


if __name__ == "__main__":
    main()
