"""Turn docs/WRITEUP.md into a one-page PDF (docs/WRITEUP.pdf) using headless Chrome."""
import html, re, subprocess, sys, tempfile
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
md = (ROOT / "docs" / "WRITEUP.md").read_text(encoding="utf-8").splitlines()

def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*", r"<em>\1</em>", t)
    t = re.sub(r"`(.+?)`", r"<code>\1</code>", t)
    return re.sub(r"(https://[^\s<·)]+)", r'<a href="\1">\1</a>', t)

out, mode = [], None
def close():
    global mode
    if mode: out.append({"ul": "</ul>", "ol": "</ol>", "table": "</table>"}[mode]); mode = None
for line in md:
    if line.startswith("|"):
        cells = [c.strip() for c in line.strip("|").split("|")]
        if set("".join(cells)) <= set("-: "): continue
        if mode != "table": close(); out.append("<table>"); mode = "table"; tag = "th"
        else: tag = "td"
        out.append("<tr>" + "".join(f"<{tag}>{inline(c)}</{tag}>" for c in cells) + "</tr>"); continue
    m = re.match(r"^(\d+)\. (.*)", line)
    if line.startswith("- ") or m:
        kind = "ol" if m else "ul"
        if mode != kind: close(); out.append(f"<{kind}>"); mode = kind
        out.append("<li>" + inline(m.group(2) if m else line[2:]) + "</li>"); continue
    close()
    if line.startswith("# "): out.append("<h1>" + inline(line[2:]) + "</h1>")
    elif line.startswith("## "): out.append("<h2>" + inline(line[3:]) + "</h2>")
    elif line.strip(): out.append("<p>" + inline(line) + "</p>")
close()
css = """@page{size:A4;margin:9mm 11mm}body{font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:8.6pt;line-height:1.3;color:#111}
h1{font-size:12.5pt;margin:0 0 3px}h2{font-size:10pt;margin:6px 0 2px;color:#1b5fa8;border-bottom:1px solid #ddd}
p{margin:2px 0}ol,ul{margin:2px 0;padding-left:15px}li{margin:1px 0}a{color:#1b5fa8}code{font-size:8pt}
table{border-collapse:collapse;width:100%;margin:3px 0;font-size:8.2pt}th,td{border:1px solid #ccc;padding:2px 5px;text-align:left}th{background:#eef4fb}"""
with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
    f.write('<!doctype html><meta charset="utf-8"><title>SHADOWCASE AI write-up</title><style>' + css + "</style>" + "\n".join(out))
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
subprocess.run([chrome, "--headless", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={ROOT/'docs'/'WRITEUP.pdf'}", f.name], check=True, capture_output=True)
pages = len(re.findall(rb"/Type\s*/Page[^s]", (ROOT / "docs" / "WRITEUP.pdf").read_bytes()))
print("pages:", pages); sys.exit(0 if pages == 1 else 1)
