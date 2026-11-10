import os
import json
import csv
import re
import ssl
import time
import urllib.request
from bs4 import BeautifulSoup

OUTPUT_DIR = r"c:\Peptide\peppal_scraped_data"
PEPTIDES_MD_DIR = os.path.join(OUTPUT_DIR, "peptides")
PROTOCOLS_MD_DIR = os.path.join(OUTPUT_DIR, "protocols")
PROTOCOLS_PDF_DIR = os.path.join(OUTPUT_DIR, "protocols", "pdf")
GUIDES_MD_DIR = os.path.join(OUTPUT_DIR, "guides_and_articles")
RAW_HTML_DIR = os.path.join(OUTPUT_DIR, "raw_html")

for d in [PEPTIDES_MD_DIR, PROTOCOLS_MD_DIR, PROTOCOLS_PDF_DIR, GUIDES_MD_DIR, RAW_HTML_DIR]:
    os.makedirs(d, exist_ok=True)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def fetch(url, binary=False, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
                data = resp.read()
                return data if binary else data.decode('utf-8', errors='ignore')
        except Exception as e:
            if attempt == retries - 1:
                print(f"Error fetching {url}: {e}")
                return None
            time.sleep(1.5)

print("Starting PepPal Knowledge Base scraper...")

# -------------------------------------------------------------
# 1. Peptides Database
# -------------------------------------------------------------
with open(r"c:\Peptide\peptides_extracted.json", "r", encoding="utf-8") as f:
    peptides = json.load(f)

# Save JSON
with open(os.path.join(OUTPUT_DIR, "peptides_catalog.json"), "w", encoding="utf-8") as f:
    json.dump(peptides, f, indent=2)

# Save CSV summary
csv_fields = ["id", "name", "fullName", "category", "tags", "overview", "mechanismOfAction", "researchContexts", "dosing", "typicalVialSize", "waterVolume", "resultingConcentration", "instructions", "storageBefore", "storageAfter", "halfLifeAndStability"]

with open(os.path.join(OUTPUT_DIR, "peptides_catalog.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=csv_fields)
    writer.writeheader()
    for p in peptides:
        reconst = p.get("reconstitution") or {}
        storage = p.get("storage") or {}
        writer.writerow({
            "id": p.get("id", ""),
            "name": p.get("name", ""),
            "fullName": p.get("fullName", ""),
            "category": p.get("category", ""),
            "tags": "; ".join(p.get("tags") or []),
            "overview": p.get("overview", ""),
            "mechanismOfAction": p.get("mechanismOfAction", ""),
            "researchContexts": "; ".join(p.get("researchContexts") or []),
            "dosing": p.get("dosing", ""),
            "typicalVialSize": reconst.get("typicalVialSize", "") if isinstance(reconst, dict) else str(reconst),
            "waterVolume": reconst.get("waterVolume", "") if isinstance(reconst, dict) else "",
            "resultingConcentration": reconst.get("resultingConcentration", "") if isinstance(reconst, dict) else "",
            "instructions": reconst.get("instructions", "") if isinstance(reconst, dict) else "",
            "storageBefore": storage.get("beforeReconstitution", "") if isinstance(storage, dict) else str(storage),
            "storageAfter": storage.get("afterReconstitution", "") if isinstance(storage, dict) else "",
            "halfLifeAndStability": p.get("halfLifeAndStability", "")
        })

# Save individual markdown files
for p in peptides:
    reconst = p.get("reconstitution") or {}
    storage = p.get("storage") or {}
    tags_str = ", ".join(f"`{t}`" for t in p.get("tags") or [])
    contexts_str = "\n".join(f"- {c}" for c in p.get("researchContexts") or [])
    
    md_content = f"""# {p.get('name')} ({p.get('fullName')})

**Category:** {p.get('category')}  
**Tags:** {tags_str if tags_str else "N/A"}  
**Source URL:** https://peppal.io/peptide/{p.get('id')}

---

## Overview
{p.get('overview', 'N/A')}

## Mechanism of Action
{p.get('mechanismOfAction', 'N/A')}

## Research Contexts
{contexts_str if contexts_str else "N/A"}

## Dosing (PepPal Protocol / Guidelines)
{p.get('dosing', 'N/A')}

## Reconstitution Guide
- **Typical Vial Size:** {reconst.get('typicalVialSize', 'N/A') if isinstance(reconst, dict) else reconst}
- **Bacteriostatic Water Volume:** {reconst.get('waterVolume', 'N/A') if isinstance(reconst, dict) else 'N/A'}
- **Resulting Concentration:** {reconst.get('resultingConcentration', 'N/A') if isinstance(reconst, dict) else 'N/A'}
- **Instructions:** {reconst.get('instructions', 'N/A') if isinstance(reconst, dict) else 'N/A'}

## Storage Guidelines
- **Before Reconstitution:** {storage.get('beforeReconstitution', 'N/A') if isinstance(storage, dict) else storage}
- **After Reconstitution:** {storage.get('afterReconstitution', 'N/A') if isinstance(storage, dict) else 'N/A'}

## Half-Life & Stability
{p.get('halfLifeAndStability', 'N/A')}
"""
    filename = f"{p.get('id')}.md"
    with open(os.path.join(PEPTIDES_MD_DIR, filename), "w", encoding="utf-8") as f:
        f.write(md_content)

print(f"Generated 26 peptide markdown profiles, JSON, and CSV.")

# -------------------------------------------------------------
# 2. Protocols Database & PDFs
# -------------------------------------------------------------
with open(r"c:\Peptide\protocols_extracted.json", "r", encoding="utf-8") as f:
    protocols = json.load(f)

with open(os.path.join(OUTPUT_DIR, "protocols_catalog.json"), "w", encoding="utf-8") as f:
    json.dump(protocols, f, indent=2)

for p in protocols:
    slug = p.get('id') or re.sub(r'[^a-zA-Z0-9_-]', '_', p.get('name', 'protocol'))
    pdf_url = p.get('pdfUrl')
    downloaded_pdf_path = None
    if pdf_url:
        full_pdf_url = f"https://peppal.io{pdf_url}"
        pdf_filename = os.path.basename(pdf_url)
        pdf_dest = os.path.join(PROTOCOLS_PDF_DIR, pdf_filename)
        if not os.path.exists(pdf_dest):
            print(f"Downloading PDF: {full_pdf_url} ...")
            pdf_bytes = fetch(full_pdf_url, binary=True)
            if pdf_bytes:
                with open(pdf_dest, "wb") as pf:
                    pf.write(pdf_bytes)
                downloaded_pdf_path = f"pdf/{pdf_filename}"
        else:
            downloaded_pdf_path = f"pdf/{pdf_filename}"

    # Generate Markdown for protocol
    titration_rows = ""
    if p.get('titrationSchedule'):
        titration_rows = "\n| Week / Phase | Dose | Frequency | Notes |\n|---|---|---|---|\n"
        for t in p.get('titrationSchedule'):
            titration_rows += f"| {t.get('week', t.get('phase', ''))} | {t.get('dose', '')} | {t.get('frequency', '')} | {t.get('notes', '')} |\n"

    md_content = f"""# {p.get('name')}

**Subtitle:** {p.get('subtitle', '')}  
**Tagline:** {p.get('tagline', '')}  
**Cycle Structure:** {p.get('cycleInfo', '')}  
**PDF Reference:** {downloaded_pdf_path if downloaded_pdf_path else (pdf_url if pdf_url else 'None')}  

---

## Description / What Is It
{p.get('whatIsIt', '')}

{titration_rows}

## Full Protocol Details
```json
{json.dumps(p, indent=2)}
```
"""
    with open(os.path.join(PROTOCOLS_MD_DIR, f"{slug}.md"), "w", encoding="utf-8") as f:
        f.write(md_content)

print(f"Generated 17 protocol markdown profiles, JSON catalog, and downloaded PDFs.")

# -------------------------------------------------------------
# 3. Guides, Articles & Knowledge Pages
# -------------------------------------------------------------
site_articles = [
    {"url": "https://peppal.io/knowledge", "slug": "knowledge_home", "title": "Knowledge Base Overview"},
    {"url": "https://peppal.io/guides/peptides-for-dummies", "slug": "peptides_for_dummies", "title": "Peptides for Dummies"},
    {"url": "https://peppal.io/guides/semax-intranasal", "slug": "semax_intranasal_guide", "title": "Semax Intranasal Guide"},
    {"url": "https://peppal.io/research/quintuple-agonist", "slug": "quintuple_agonist_research", "title": "Quintuple Agonist Research"},
    {"url": "https://peppal.io/top10peptides", "slug": "top_10_peptides", "title": "Top 10 Research Peptides"},
    {"url": "https://peppal.io/skin-peptides", "slug": "skin_peptides_stack", "title": "Skin Peptides: KPV, GHK-Cu, Glutathione"},
    {"url": "https://peppal.io/fda-ban", "slug": "fda_peptide_ban", "title": "FDA GLP-1 Compounding Ban Context"},
    {"url": "https://peppal.io/fda-peptide-win", "slug": "fda_peptide_vote_2026", "title": "FDA Peptide Vote 2026 Analysis"},
    {"url": "https://peppal.io/hanny-protocol", "slug": "hanny_protocol", "title": "Iron Hanny Peptide Stack Guide"},
    {"url": "https://peppal.io/research", "slug": "research_library", "title": "Peptide Research Library & Scientific Citations"},
    {"url": "https://peppal.io/calculator", "slug": "reconstitution_calculator", "title": "Reconstitution Calculator Reference"}
]

for item in site_articles:
    url = item["url"]
    slug = item["slug"]
    print(f"Fetching article: {url} ...")
    html = fetch(url)
    if not html:
        continue
    
    # Save raw html
    with open(os.path.join(RAW_HTML_DIR, f"{slug}.html"), "w", encoding="utf-8") as f:
        f.write(html)
        
    soup = BeautifulSoup(html, "html.parser")
    # Remove script and style tags
    for s in soup(["script", "style", "noscript", "svg"]):
        s.decompose()
        
    main = soup.find('main') or soup.find('article') or soup.find('body')
    text = main.get_text(separator="\n", strip=True) if main else soup.get_text(separator="\n", strip=True)
    
    # Format markdown
    md = f"""# {item['title']}

**Source URL:** {url}  
**Scraped At:** 2026-11-07  

---

{text}
"""
    with open(os.path.join(GUIDES_MD_DIR, f"{slug}.md"), "w", encoding="utf-8") as f:
        f.write(md)

print("Scraping completed successfully! All data archived in c:\\Peptide\\peppal_scraped_data")
