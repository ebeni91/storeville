import os, re

src_dir = '/home/et3on/Desktop/storeville/mobile/src'

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx') and file != 'SplashScreen.tsx':
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            if '<StatusBar' in content:
                def replace_func(match):
                    tag = match.group(0)
                    if 'translucent' not in tag:
                        if tag.endswith('/>'):
                            return tag[:-2] + ' backgroundColor="transparent" translucent={true} />'
                        elif tag.endswith('>'):
                            return tag[:-1] + ' backgroundColor="transparent" translucent={true}>'
                    return tag

                new_content = re.sub(r'<StatusBar[^>]*>', replace_func, content)
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Updated {file}")

print("Done")
