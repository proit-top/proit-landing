"""Generate PROIT's original social preview from local geometry and system fonts."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math
root = Path(__file__).resolve().parents[1]
im = Image.new('RGB', (1200, 630), '#111614')
d = ImageDraw.Draw(im)
font_path = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
def font(size):
    return ImageFont.truetype(font_path, size)
d.text((64, 55), 'PROIT', font=font(38), fill='#c1e89a')
d.text((60, 205), 'IT, на которое', font=font(65), fill='#edf0e8')
d.text((60, 280), 'можно опереться', font=font(65), fill='#c1e89a')
d.text((64, 460), 'Поддержка. Инфраструктура. AI-автоматизация.', font=font(24), fill='#acb7ae')
d.text((64, 550), 'proit.top', font=font(22), fill='#acb7ae')
for i in range(64):
    u = i * 2 * math.pi / 64
    points = []
    for j in range(97):
        v = j * 2 * math.pi / 96
        x = (135 + 50 * math.cos(v)) * math.cos(u)
        y = (135 + 50 * math.cos(v)) * math.sin(u)
        z = 50 * math.sin(v)
        yy = y * math.cos(.83) - z * math.sin(.83)
        zz = y * math.sin(.83) + z * math.cos(.83)
        xx = x * math.cos(-.5) + zz * math.sin(-.5)
        points.append((960 + xx, 285 + yy))
    d.line(points, fill='#77945f', width=1)
im.save(root / 'public/og.png', optimize=True)
