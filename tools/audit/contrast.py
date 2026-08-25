"""
Contrast audit for the S-OS token system.

    python3 tools/audit/contrast.py

Parses src/styles/tokens.css and computes real WCAG 2.1 contrast ratios for
every text token against the surfaces it actually renders on — including the
translucent ones, which are the whole reason this exists. A glass panel is not
a colour; it is white at 6% over whatever is behind it, and "whatever is behind
it" is a wallpaper gradient. Eyeballing that is how an interface ends up with a
4.1:1 label nobody noticed.

Alpha compositing is done properly: a translucent surface is flattened over its
backdrop before the ratio is taken, and translucent text is flattened over the
flattened surface.

Exit code is non-zero if any pairing marked as body text fails AA, so this can
be wired into CI later.
"""

from __future__ import annotations

import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
TOKENS = os.path.join(ROOT, "src", "styles", "tokens.css")

Rgba = tuple[float, float, float, float]


# --- parsing -------------------------------------------------------------
def parse_tokens(path: str) -> dict[str, str]:
    """Every `--sos-*` declaration in :root. Later blocks (high contrast) are
    parsed separately by scoping the read to a selector."""
    text = open(path, encoding="utf-8").read()
    # Strip comments so a hex value mentioned in prose is never mistaken for a
    # declaration.
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    root = re.search(r":root\s*\{(.*?)\n\}", text, re.S)
    assert root, "no :root block"
    return dict(re.findall(r"(--sos-[\w-]+):\s*([^;]+);", root.group(1)))


def parse_scope(path: str, selector: str) -> dict[str, str]:
    text = re.sub(r"/\*.*?\*/", "", open(path, encoding="utf-8").read(), flags=re.S)
    block = re.search(re.escape(selector) + r"\s*\{(.*?)\n\}", text, re.S)
    if not block:
        return {}
    return dict(re.findall(r"(--sos-[\w-]+):\s*([^;]+);", block.group(1)))


def resolve(value: str, tokens: dict[str, str], depth: int = 0) -> str:
    """Follow var() indirection to a literal colour."""
    if depth > 8:
        raise ValueError(f"cyclic token reference: {value}")
    m = re.fullmatch(r"var\((--[\w-]+)\)", value.strip())
    if m:
        return resolve(tokens[m.group(1)], tokens, depth + 1)
    return value.strip()


def to_rgba(value: str) -> Rgba:
    value = value.strip()

    m = re.fullmatch(r"#([0-9a-fA-F]{6})", value)
    if m:
        h = m.group(1)
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 1.0)

    m = re.fullmatch(r"#([0-9a-fA-F]{3})", value)
    if m:
        h = m.group(1)
        return tuple([int(c * 2, 16) for c in h] + [1.0])  # type: ignore[return-value]

    # rgb(R G B / A) — the space-separated form used throughout the tokens.
    m = re.fullmatch(r"rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*/\s*([\d.]+))?\s*\)", value)
    if m:
        a = float(m.group(4)) if m.group(4) else 1.0
        return (float(m.group(1)), float(m.group(2)), float(m.group(3)), a)

    raise ValueError(f"unrecognised colour: {value!r}")


# --- colour maths --------------------------------------------------------
def over(fg: Rgba, bg: Rgba) -> Rgba:
    """Source-over compositing. `bg` is assumed opaque."""
    a = fg[3]
    return (
        fg[0] * a + bg[0] * (1 - a),
        fg[1] * a + bg[1] * (1 - a),
        fg[2] * a + bg[2] * (1 - a),
        1.0,
    )


def luminance(c: Rgba) -> float:
    def channel(v: float) -> float:
        v /= 255.0
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

    r, g, b = channel(c[0]), channel(c[1]), channel(c[2])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(fg: Rgba, bg: Rgba) -> float:
    a, b = luminance(fg), luminance(bg)
    lighter, darker = max(a, b), min(a, b)
    return (lighter + 0.05) / (darker + 0.05)


# --- the audit -----------------------------------------------------------
# (label, text token, surface tokens stacked bottom-to-top, requirement)
#
# "requirement" is the real one for that pairing, not a blanket 4.5. Large
# text and non-text indicators have lower thresholds under WCAG, and applying
# 4.5 everywhere produces false failures that train you to ignore the report.
BODY = ("body", 4.5)
LARGE = ("large text (>=18.66px bold / 24px)", 3.0)
NONTEXT = ("non-text indicator", 3.0)
# Reported but not gated. Inert text is exempt from 1.4.3, and a decorative
# hairline is not "information required to identify a component" while the
# thing it edges is identifiable another way. Both are printed so a later
# change that makes them load-bearing is visible rather than silent.
INERT = ("inert text (exempt)", 0.0)
DECORATIVE = ("decorative (not gated)", 0.0)

CHECKS: list[tuple[str, str, list[str], tuple[str, float]]] = [
    # Application content — where all the prose lives.
    ("primary on app", "--sos-text-primary", ["--sos-bg-app"], BODY),
    ("secondary on app", "--sos-text-secondary", ["--sos-bg-app"], BODY),
    ("muted on app", "--sos-text-muted", ["--sos-bg-app"], BODY),
    ("accent on app", "--sos-text-accent", ["--sos-bg-app"], BODY),
    # Wells: terminal output and inputs.
    ("primary on inset", "--sos-text-primary", ["--sos-bg-inset"], BODY),
    ("secondary on inset", "--sos-text-secondary", ["--sos-bg-inset"], BODY),
    ("muted on inset", "--sos-text-muted", ["--sos-bg-inset"], BODY),
    # Glass over the application background — panels inside windows.
    ("primary on glass/app", "--sos-text-primary", ["--sos-bg-app", "--sos-glass-bg"], BODY),
    ("secondary on glass/app", "--sos-text-secondary", ["--sos-bg-app", "--sos-glass-bg"], BODY),
    ("muted on glass/app", "--sos-text-muted", ["--sos-bg-app", "--sos-glass-bg"], BODY),
    # Window chrome over the darkest and lightest wallpaper stops. The title
    # bar has to work over both ends of the gradient.
    ("primary on chrome/base", "--sos-text-primary", ["--sos-bg-base", "--sos-chrome-bg"], BODY),
    ("primary on chrome/raised", "--sos-text-primary", ["--sos-bg-raised", "--sos-chrome-bg"], BODY),
    (
        "secondary on chrome/raised",
        "--sos-text-secondary",
        ["--sos-bg-raised", "--sos-chrome-bg"],
        BODY,
    ),
    (
        "primary on inactive chrome",
        "--sos-text-primary",
        ["--sos-bg-raised", "--sos-chrome-bg-inactive"],
        BODY,
    ),
    # Taskbar and menus.
    ("primary on taskbar", "--sos-text-primary", ["--sos-bg-raised", "--sos-taskbar-bg"], BODY),
    ("secondary on taskbar", "--sos-text-secondary", ["--sos-bg-raised", "--sos-taskbar-bg"], BODY),
    ("primary on menu", "--sos-text-primary", ["--sos-bg-raised", "--sos-menu-bg"], BODY),
    ("secondary on menu", "--sos-text-secondary", ["--sos-bg-raised", "--sos-menu-bg"], BODY),
    ("muted on menu", "--sos-text-muted", ["--sos-bg-raised", "--sos-menu-bg"], BODY),
    # Desktop icon labels sit directly on the wallpaper.
    ("primary on wallpaper", "--sos-text-primary", ["--sos-bg-raised"], BODY),
    # Status colours: badge text on the application background.
    ("status stable", "--sos-status-stable", ["--sos-bg-app"], NONTEXT),
    ("status beta", "--sos-status-beta", ["--sos-bg-app"], NONTEXT),
    ("status dev", "--sos-status-dev", ["--sos-bg-app"], NONTEXT),
    ("status planned", "--sos-status-planned", ["--sos-bg-app"], NONTEXT),
    ("status danger", "--sos-status-danger", ["--sos-bg-app"], NONTEXT),
    # The focus ring must be visible against every surface it can land on.
    ("focus ring on app", "--sos-focus-ring", ["--sos-bg-app"], NONTEXT),
    ("focus ring on menu", "--sos-focus-ring", ["--sos-bg-raised", "--sos-menu-bg"], NONTEXT),
    ("focus ring on chrome", "--sos-focus-ring", ["--sos-bg-raised", "--sos-chrome-bg"], NONTEXT),
    ("focus ring on wallpaper", "--sos-focus-ring", ["--sos-bg-raised"], NONTEXT),
    # Interactive accent used for buttons and links.
    ("accent-500 on app", "--sos-accent-500", ["--sos-bg-app"], NONTEXT),
    ("inverse on accent-600", "--sos-text-inverse", ["--sos-accent-600"], BODY),
    ("inverse on accent-500", "--sos-text-inverse", ["--sos-accent-500"], BODY),
    # Placeholders are text and get the full text requirement.
    ("placeholder on inset", "--sos-text-placeholder", ["--sos-bg-inset"], BODY),
    ("disabled on app", "--sos-text-disabled", ["--sos-bg-app"], INERT),
    # Glass borders. Panels and windows are grouping surfaces rather than
    # controls, and a window is still identifiable by its shadow, chrome tint
    # and title bar — so the hairline is decorative and measured, not gated.
    ("glass border on app", "--sos-glass-border", ["--sos-bg-app"], DECORATIVE),
]


def flatten(stack: list[str], tokens: dict[str, str]) -> Rgba:
    """Composite a stack of surfaces bottom-to-top into one opaque colour."""
    base = to_rgba(resolve(tokens[stack[0]], tokens))
    assert base[3] == 1.0, f"{stack[0]} must be opaque to serve as a backdrop"
    for layer in stack[1:]:
        base = over(to_rgba(resolve(tokens[layer], tokens)), base)
    return base


def run(tokens: dict[str, str], label: str) -> int:
    print(f"\n{'=' * 78}\n{label}\n{'=' * 78}")
    print(f"{'pairing':<30}{'ratio':>8}  {'need':>5}  {'':<4}requirement")
    failures = 0

    for name, text_token, surface_stack, (req_label, threshold) in CHECKS:
        if text_token not in tokens or any(s not in tokens for s in surface_stack):
            print(f"{name:<30}{'—':>8}  {'':>5}  SKIP  token not defined in this scope")
            continue

        backdrop = flatten(surface_stack, tokens)
        text = over(to_rgba(resolve(tokens[text_token], tokens)), backdrop)
        value = ratio(text, backdrop)
        ok = value >= threshold
        if not ok:
            failures += 1
        mark = "ok  " if ok else "FAIL"
        print(f"{name:<30}{value:>8.2f}  {threshold:>5.1f}  {mark}  {req_label}")

    print(f"\n{failures} failing pairing(s).")
    return failures


def main() -> None:
    base = parse_tokens(TOKENS)
    total = run(base, "Default theme")

    hc_overrides = parse_scope(TOKENS, "[data-contrast='high']")
    if hc_overrides:
        merged = {**base, **hc_overrides}
        total += run(merged, "High-contrast mode")
    else:
        print("\nNo [data-contrast='high'] block found — high-contrast mode not audited.")

    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
