# Curriculum generator

`content/curriculum.json` and `CURRICULUM.md` are generated from `lessons_data.py` so they never disagree.

```bash
cd handbook/tools/gen_curriculum
python3 gen.py     # writes content/curriculum.json and parts.json
python3 fill.py    # fills template.md -> CURRICULUM.md
```

Edit lessons in `lessons_data.py` (plan level: titles, pages, objectives, risk, release).
Lesson *status* also lives there — update it when a lesson moves through review.
