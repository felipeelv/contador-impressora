import os
import json
import re

conteudos_dir = "/Users/feliperosamini/contador-impressora/Conteudos Anuais"
output_file = "/Users/feliperosamini/contador-impressora/conteudos.json"

db = {}

for filename in os.listdir(conteudos_dir):
    if filename.endswith(".md"):
        filepath = os.path.join(conteudos_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()

        disciplina = filename.replace(".md", "")
        db[disciplina] = {}

        current_serie = None
        current_bimestre = None
        current_unidade = None

        for line in lines:
            line = line.strip()
            if line.startswith("## "):
                current_serie = line.replace("## ", "").strip()
                db[disciplina][current_serie] = {}
            elif line.startswith("### "):
                if current_serie:
                    # e.g., "### 1º Bimestre — Ciclo Celular..."
                    match = re.match(r"### (\d)º Bimestre", line)
                    if match:
                        current_bimestre = match.group(1)
                    else:
                        current_bimestre = (
                            line.replace("### ", "").split("—")[0].strip()
                        )
                    db[disciplina][current_serie][current_bimestre] = {}
            elif line.startswith("#### "):
                if current_serie and current_bimestre:
                    current_unidade = line.replace("#### ", "").strip()
                    db[disciplina][current_serie][current_bimestre][
                        current_unidade
                    ] = []
            elif line.startswith("- "):
                if current_serie and current_bimestre and current_unidade:
                    capitulo = line.replace("- ", "").strip()
                    db[disciplina][current_serie][current_bimestre][
                        current_unidade
                    ].append(capitulo)

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("Gerado conteudos.json")
