import re
from collections import Counter

content = open('src/data/shows.ts').read()
ids = re.findall(r"id:\s*'([^']*)'", content)
counts = Counter(ids)
for id, count in counts.items():
    if count > 1:
        print(f"Duplicate ID found: {id} ({count} times)")
