#!/usr/bin/env python3
"""
Same-host crawl for the AdSense route inventory (2026-10-12).

  python3 scripts/audit-crawl.py https://www.pharmawallah.com live.json   # production, GET only
  python3 scripts/audit-crawl.py http://localhost:3100 local.json         # after `next start`

Starts at / and every <loc> in /sitemap.xml, follows internal links, four requests at a
time, never follows redirects (they are recorded). Then run scripts/route-inventory.py.
"""

import sys, re, json, urllib.request, urllib.parse, concurrent.futures as cf, html
base = sys.argv[1].rstrip("/"); out = sys.argv[2]; MAX = int(sys.argv[3]) if len(sys.argv) > 3 else 600
host = urllib.parse.urlparse(base).netloc
WWW = "https://www.pharmawallah.com"
def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "PharmaWallah-audit/1.0"})
    class NoRedir(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k): return None
    op = urllib.request.build_opener(NoRedir)
    try:
        r = op.open(req, timeout=60); return r.status, dict(r.headers), r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read().decode("utf-8", "ignore") if e.fp else ""
    except Exception as e:
        return 0, {}, str(e)
def analyse(path):
    st, hd, body = get(base + path)
    t = re.search(r"<title>(.*?)</title>", body, re.S)
    can = re.search(r'rel="canonical" href="([^"]+)"', body)
    rob = re.search(r'<meta name="robots" content="([^"]+)"', body)
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", body, re.S)
    text = re.sub(r"<script.*?</script>|<style.*?</style>|<[^>]+>", " ", body, flags=re.S)
    links = set()
    for m in re.finditer(r'href="([^"#]+)', body):
        u = html.unescape(m.group(1))
        p = urllib.parse.urlparse(u)
        if (p.netloc in ("", host, "www.pharmawallah.com")) and u.startswith(("/", base, WWW)) and not re.search(r"\.(png|jpe?g|svg|webp|ico|css|js|json|xml|txt|pdf|apk|woff2?)$", p.path) and not p.path.startswith(("/_next", "/api/")):
            links.add(p.path.rstrip("/") or "/")
    return {
        "path": path, "status": st, "location": hd.get("Location") or hd.get("location"),
        "title": html.unescape(t.group(1).strip()) if t else None,
        "canonical": can.group(1) if can else None, "robots": rob.group(1) if rob else None,
        "h1": re.sub(r"<[^>]+>|\s+", " ", html.unescape(h1.group(1))).strip()[:120] if h1 else None,
        "words": len(text.split()), "ldjson": body.count("application/ld+json"),
        "softRedirect": "NEXT_REDIRECT" in body, "notFoundUI": ("404" in (t.group(1) if t else "")) or "could not be found" in body,
        "links": sorted(links),
    }
seen, queue, results = set(), ["/"], {}
st, _, sm = get(base + "/sitemap.xml")
sitemap = [urllib.parse.urlparse(u).path.rstrip("/") or "/" for u in re.findall(r"<loc>([^<]+)</loc>", sm)]
queue += sitemap
with cf.ThreadPoolExecutor(4) as ex:
    while queue and len(results) < MAX:
        batch = []
        while queue and len(batch) < 8:
            p = queue.pop(0)
            if p in seen: continue
            seen.add(p); batch.append(p)
        for r in ex.map(analyse, batch):
            results[r["path"]] = r
            for l in r["links"]:
                if l not in seen: queue.append(l)
for r in results.values(): r["inSitemap"] = r["path"] in sitemap
json.dump({"base": base, "sitemap": sitemap, "pages": list(results.values())}, open(out, "w"), indent=1)
print(len(results), "pages;", sum(1 for r in results.values() if r["status"] != 200), "non-200")
