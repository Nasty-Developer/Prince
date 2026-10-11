from pathlib import Path

import fitz


SOURCE = Path(
    "attached_assets/SaveStreet_Dogs_Complete_Master_Implementation_Prompt_1791737848027.pdf"
)
OUTPUT = Path(".agents/outputs/master-implementation-prompt")
OUTPUT.mkdir(parents=True, exist_ok=True)

document = fitz.open(SOURCE)
page_images: list[Path] = []

for index, page in enumerate(document, start=1):
    image_path = OUTPUT / f"page-{index:02d}.png"
    pixmap = page.get_pixmap(matrix=fitz.Matrix(0.75, 0.75), alpha=False)
    pixmap.save(image_path)
    page_images.append(image_path)

sheet = fitz.open()
columns = 4
rows = 4
sheet_page = sheet.new_page(width=1200, height=1650)
margin = 24
gap = 16
cell_width = (1200 - 2 * margin - (columns - 1) * gap) / columns
cell_height = (1650 - 2 * margin - (rows - 1) * gap) / rows

for index, image_path in enumerate(page_images):
    row, column = divmod(index, columns)
    x = margin + column * (cell_width + gap)
    y = margin + row * (cell_height + gap)
    rect = fitz.Rect(x, y, x + cell_width, y + cell_height)
    sheet_page.insert_image(rect, filename=str(image_path), keep_proportion=True)

overview_path = OUTPUT / "contact-sheet.png"
sheet_page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False).save(overview_path)
print(f"Rendered {len(page_images)} pages to {OUTPUT}; overview: {overview_path}")
