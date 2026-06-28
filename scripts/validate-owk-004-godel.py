import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
BADGE_DIR = REPO_ROOT / "badges" / "owk-004-godel"
MANIFEST_PATH = BADGE_DIR / "manifest.json"


def main() -> int:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    badge_files = sorted(path.name for path in BADGE_DIR.glob("badge-*.svg"))
    manifest_files = sorted(entry["file"] for entry in manifest["files"])
    errors: list[str] = []

    if manifest.get("bountyId") != "owk-004":
        errors.append("manifest bountyId must be owk-004")

    if len(badge_files) != 8:
        errors.append(f"expected 8 badge SVGs, found {len(badge_files)}")

    if badge_files != manifest_files:
        errors.append("manifest files do not match badge SVG files")

    required_patterns = [
        (re.compile(r"<svg\b"), "missing <svg> root"),
        (re.compile(r'viewBox="0 0 256 256"'), "missing 256 viewBox"),
        (re.compile(r'role="img"'), 'missing role="img"'),
        (re.compile(r'aria-labelledby="title desc"'), "missing aria-labelledby"),
        (re.compile(r"<title\b"), "missing <title>"),
        (re.compile(r"<desc\b"), "missing <desc>"),
    ]
    blocked_patterns = [
        (re.compile(r"<script\b", re.I), "contains script tag"),
        (re.compile(r"\son[a-z]+\s*=", re.I), "contains inline event handler"),
        (re.compile(r"\bhref\s*=", re.I), "contains href reference"),
        (re.compile(r"<image\b", re.I), "contains embedded image tag"),
        (re.compile(r"<foreignObject\b", re.I), "contains foreignObject"),
        (re.compile(r"javascript:", re.I), "contains javascript URL"),
        (re.compile(r"url\(\s*https?:", re.I), "contains external paint server URL"),
    ]

    for file_name in badge_files:
        path = BADGE_DIR / file_name
        svg = path.read_text(encoding="utf-8")

        try:
            ET.parse(path)
        except ET.ParseError as exc:
            errors.append(f"{file_name}: invalid XML: {exc}")

        for pattern, message in required_patterns:
            if not pattern.search(svg):
                errors.append(f"{file_name}: {message}")

        for pattern, message in blocked_patterns:
            if pattern.search(svg):
                errors.append(f"{file_name}: {message}")

    if errors:
        print("OWK-004 Godel badge validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(f"OWK-004 Godel badge validation passed for {len(badge_files)} SVG badges.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
