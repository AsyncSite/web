#!/usr/bin/env python3
import re

def kebab_to_camel(match):
    """Convert kebab-case to camelCase"""
    text = match.group(0)[1:]  # Remove the dot
    parts = text.split('-')
    if len(parts) == 1:
        return '.' + parts[0]
    # First part stays lowercase, rest are capitalized
    camel = parts[0] + ''.join(word.capitalize() for word in parts[1:])
    return '.' + camel

def convert_css_module(input_file, output_file):
    with open(input_file, 'r') as f:
        content = f.read()
    
    # Remove all ".profile-page " prefixes (with space)
    content = re.sub(r'\.profile-page\s+\.', '.', content)
    
    # Convert kebab-case class names to camelCase
    # Match .class-name but not CSS properties like background-color
    content = re.sub(r'\.[a-z]+(-[a-z]+)+(?=[^:]*\{|\s|,|\.)', kebab_to_camel, content)
    
    with open(output_file, 'w') as f:
        f.write(content)
    
    print(f"Converted {input_file} to {output_file}")

if __name__ == "__main__":
    convert_css_module(
        "/Users/rene/asyncsite/web/src/pages/user/ProfilePage.module.css",
        "/Users/rene/asyncsite/web/src/pages/user/ProfilePage.module.css.new"
    )