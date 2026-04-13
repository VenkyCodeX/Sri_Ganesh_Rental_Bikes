import re
with open('styles.css', 'r') as f:
    content = f.read()
content = re.sub(r'var\(--yellow\)', 'var(--orange)', content)
content = re.sub(r'var\(--yellow-dark\)', 'var(--orange-dark)', content)
with open('styles.css', 'w') as f:
    f.write(content)
print('Color variables updated')