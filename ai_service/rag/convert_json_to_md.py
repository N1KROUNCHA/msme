import json
import os

def convert_json_to_md(json_path, md_path):
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    md_content = "# Comprehensive MSME Schemes Knowledge Base\n\n"
    
    for item in data:
        ministry = item.get("ministry", "N/A")
        name = item.get("scheme_name", "N/A")
        desc = item.get("description", "N/A")
        assistance = item.get("nature_of_assistance", "N/A")
        who = item.get("who_can_apply", "N/A")
        how = item.get("how_to_apply", "N/A")
        

        md_content += f"## {ministry}: {name}\n"
        md_content += f"**Description**: {desc}\n\n"
        if assistance:
            md_content += f"**Nature of Assistance**: {assistance}\n\n"
        md_content += f"**Who can Apply**: {who}\n\n"
        md_content += f"**How to Apply**: {how}\n\n"
        md_content += "---\n\n"

    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    print(f"Successfully converted {len(data)} schemes to {md_path}")

if __name__ == "__main__":
    convert_json_to_md(
        "rag/data/msme_schemes_full_with_ministry.json", 
        "rag/data/comprehensive_schemes.md"
    )
