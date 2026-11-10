import os
import json
import csv
import ssl
import time
import urllib.request
import re

OUTPUT_BASE = r"c:\Peptide\peppal_scraped_data\vault"
KINDS = ["peptide", "supplement", "cosmetic", "goal"]

for k in KINDS:
    os.makedirs(os.path.join(OUTPUT_BASE, f"{k}s"), exist_ok=True)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

supabase_url = "https://hgpfycaljcklvgnltubs.supabase.co"
apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncGZ5Y2FsamNrbHZnbmx0dWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjEzMjIsImV4cCI6MjA4ODYzNzMyMn0._zfEReVY7mfBfcOBekha8tlwwpqk0O2Vb3F1TXmCBSI"
user_token = "eyJhbGciOiJFUzI1NiIsImtpZCI6ImJjNDljZTZmLTlmOWItNDkzNC1hYzVhLTdmODZjYTllNWVkOCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2hncGZ5Y2FsamNrbHZnbmx0dWJzLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmMTg2ZmM2OS1jNmQwLTQ3NjQtODRkZC1mMTE5MjNlYzQ3ZWEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzk0MDQ1MzE1LCJpYXQiOjE3OTQwNDE3MTUsImVtYWlsIjoiaXNobWVldC5zaW5naC5kZWxAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImlzaG1lZXQuc2luZ2guZGVsQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJLYXJhbiBTaW5naCIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZjE4NmZjNjktYzZkMC00NzY0LTg0ZGQtZjExOTIzZWM0N2VhIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3OTM5NjMxMDd9XSwic2Vzc2lvbl9pZCI6IjU0ODc3N2Q5LTM0ZmMtNGE5MS1iMTMwLTQ0NTJiNzJmZWE3NCIsImlzX2Fub255bW91cyI6ZmFsc2V9.Xds83aeHBPdv7W8-SXVnO9JX4bYKt1Smrik5DLfCIjgpJA7BX7W8T5r7jt1Ocx1wxBCEZj0fjw5Tkej_DAEGMg"

headers = {
    "apikey": apikey,
    "Authorization": f"Bearer {user_token}",
    "Range-Unit": "items"
}

all_entries = []

for kind in KINDS:
    print(f"\n--- Fetching kind: {kind} ---")
    kind_entries = []
    limit = 100
    offset = 0
    
    while True:
        # Supabase uses Range header or limit/offset
        url = f"{supabase_url}/rest/v1/vault_entries?kind=eq.{kind}&order=name.asc&limit={limit}&offset={offset}"
        req = urllib.request.Request(url, headers=headers)
        
        try:
            with urllib.request.urlopen(req, context=ctx) as r:
                batch = json.loads(r.read().decode('utf-8'))
                if not batch:
                    break
                kind_entries.extend(batch)
                offset += len(batch)
                print(f"  Fetched {len(kind_entries)} {kind}s so far...")
                if len(batch) < limit:
                    break
        except Exception as e:
            print(f"Error fetching {kind} at offset {offset}: {e}")
            break
            
    print(f"Total {kind}s downloaded: {len(kind_entries)}")
    all_entries.extend(kind_entries)
    
    # Save kind JSON
    with open(os.path.join(OUTPUT_BASE, f"vault_{kind}s.json"), "w", encoding="utf-8") as f:
        json.dump(kind_entries, f, indent=2)
        
    # Save individual Markdown profiles
    for item in kind_entries:
        slug = item.get("slug") or re.sub(r'[^a-zA-Z0-9_-]', '_', item.get("name", "entry"))
        md = f"""# {item.get('name')}

- **Kind:** {item.get('kind')}
- **Also Known As:** {item.get('aka') or 'N/A'}
- **Category:** {item.get('category') or 'N/A'}
- **Evidence Level:** {item.get('evidence') or 'N/A'}
- **Confidence:** {item.get('confidence')}/10
- **Dose / Pattern:** {item.get('dose') or 'N/A'}
- **Source Volume:** {item.get('source') or 'N/A'}
- **Source URL:** https://peppal.io/vault/{item.get('kind')}/{item.get('slug')}

---

## Detailed Profile & Body Analysis
{item.get('body') or 'No detailed profile text provided.'}
"""
        filepath = os.path.join(OUTPUT_BASE, f"{kind}s", f"{slug}.md")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(md)

print(f"\nTotal Vault entries fetched across all kinds: {len(all_entries)}")

# Save master JSON
with open(os.path.join(OUTPUT_BASE, "vault_all_entries.json"), "w", encoding="utf-8") as f:
    json.dump(all_entries, f, indent=2)

# Save master CSV
csv_cols = ["id", "kind", "name", "slug", "aka", "category", "evidence", "confidence", "dose", "entry_number", "source", "created_at", "body"]
with open(os.path.join(OUTPUT_BASE, "vault_all_entries.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=csv_cols)
    writer.writeheader()
    for row in all_entries:
        writer.writerow({k: row.get(k, "") for k in csv_cols})

print("Completed saving all Vault entries in JSON, CSV, and Markdown!")
