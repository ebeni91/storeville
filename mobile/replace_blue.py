import os

src_dir = '/home/et3on/Desktop/storeville/mobile/src'

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            new_content = content.replace('#6366f1', '#111827')
            new_content = new_content.replace('#818cf8', '#ffffff')
            new_content = new_content.replace('rgba(99,102,241,0.15)', 'rgba(0,0,0,0.08)')
            new_content = new_content.replace('rgba(99,102,241,0.1)', 'rgba(0,0,0,0.05)')
            new_content = new_content.replace('rgba(99,102,241,0.25)', 'rgba(0,0,0,0.15)')
            new_content = new_content.replace('rgba(99,102,241,0.35)', 'rgba(0,0,0,0.20)')
            new_content = new_content.replace('rgba(99,102,241,0.5)', 'rgba(0,0,0,0.30)')
            new_content = new_content.replace('#eef2ff', '#f3f4f6') # light faint

            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {file}")

print("Done replacing blue/indigo with black/white tones.")
