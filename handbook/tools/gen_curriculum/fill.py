import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../.."))
p = json.load(open(os.path.join(HERE, "parts.json"), encoding="utf-8"))
s = p["stats"]
t = open(os.path.join(HERE, "template.md"), encoding="utf-8").read()
fmt = lambda d, order: ", ".join(f"{d.get(k,0)} {k}" for k in order)
rep = {
 "{{TOTAL}}": str(s["total"]),
 "{{RISK}}": fmt(s["by_risk"], ["low","medium","high"]),
 "{{PRI}}": fmt(s["by_pri"], ["P1","P2","P3"]),
 "{{REL}}": fmt(s["by_rel"], ["R1","R2","R3"]),
 "{{TYPE}}": fmt(s["by_type"], ["educational","record-explainer","staff-only-awareness"]),
 "{{TOC}}": p["toc"], "{{COVERAGE}}": p["coverage"], "{{LESSONS}}": p["lessons"],
 "{{R1}}": p["R1"], "{{R2}}": p["R2"], "{{R3}}": p["R3"],
 "{{R1N}}": str(s["by_rel"]["R1"]), "{{R2N}}": str(s["by_rel"]["R2"]), "{{R3N}}": str(s["by_rel"]["R3"]),
}
for k,v in rep.items(): t = t.replace(k, v)
assert "{{" not in t
open(os.path.join(ROOT, "CURRICULUM.md"),"w",encoding="utf-8").write(t)
print(len(t))
