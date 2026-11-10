import os, json

base_dir = r"c:\Peptide"
data_dir = os.path.join(base_dir, "data")

with open(os.path.join(base_dir, "peppal_scraped_data", "peptides_catalog.json"), "r", encoding="utf-8") as f:
    core_peptides = json.load(f)

with open(os.path.join(base_dir, "peppal_scraped_data", "vault", "vault_all_entries.json"), "r", encoding="utf-8") as f:
    vault_entries = json.load(f)

with open(os.path.join(base_dir, "peppal_scraped_data", "protocols_catalog.json"), "r", encoding="utf-8") as f:
    protocols = json.load(f)

with open(os.path.join(base_dir, "research_papers.json"), "r", encoding="utf-8") as f:
    research_papers = json.load(f)

# Guides
guides_dir = os.path.join(base_dir, "peppal_scraped_data", "guides_and_articles")
guides = []
if os.path.exists(guides_dir):
    for fn in os.listdir(guides_dir):
        if fn.endswith(".md"):
            slug = fn[:-3]
            with open(os.path.join(guides_dir, fn), "r", encoding="utf-8") as gf:
                content = gf.read()
            lines = content.strip().split("\n")
            title = lines[0].replace("#", "").strip() if lines else slug
            guides.append({
                "slug": slug,
                "title": title,
                "content": content
            })

library_data = {
    "corePeptides": core_peptides,
    "vaultEntries": vault_entries,
    "protocols": protocols,
    "researchPapers": research_papers,
    "guides": guides
}

output_path = os.path.join(data_dir, "peppal-library-data.js")
with open(output_path, "w", encoding="utf-8") as f:
    f.write("window.PEPPAL_DATA = " + json.dumps(library_data, indent=None) + ";\n")

print(f"Generated {output_path} (size: {os.path.getsize(output_path)} bytes)")
print(f"Core: {len(core_peptides)}, Vault: {len(vault_entries)}, Protocols: {len(protocols)}, Research: {len(research_papers)}, Guides: {len(guides)}")
