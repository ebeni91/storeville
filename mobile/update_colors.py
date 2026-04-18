import os, re

src_dir = '/home/et3on/Desktop/storeville/mobile/src'

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
                
            # Replace colors.ts exact palette updates
            if file == 'colors.ts':
                content = re.sub(r"accent:\s*'#6366f1'", "accent:       '#111827'", content)
                content = re.sub(r"accentFaint:\s*'#eef2ff'", "accentFaint:  '#f3f4f6'", content)
                content = re.sub(r"accentText:\s*'#6366f1'", "accentText:   '#111827'", content)
                
                content = re.sub(r"accent:\s*'#818cf8'", "accent:       '#ffffff'", content)
                content = re.sub(r"accentFaint:\s*'rgba\(99,102,241,0.15\)'", "accentFaint:  'rgba(255,255,255,0.15)'", content)
                content = re.sub(r"accentText:\s*'#818cf8'", "accentText:   '#ffffff'", content)
            
            else:
                # Replace #6366f1 with #111827 directly in most files EXCEPT we need to be careful about text colors
                # For now, let's just make sure ProfileScreen and SellerSettingsScreen get handled.
                pass
                
            with open(filepath, 'w') as f:
                f.write(content)

print("Done")
