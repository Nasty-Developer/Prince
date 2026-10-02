from pathlib import Path
import fitz

pdf_path = Path('attached_assets/Replit_Ecommerce_Order_Flow_Prompt_1789997832973.pdf')
out_dir = Path('.agents/outputs/order-flow-pdf')
out_dir.mkdir(parents=True, exist_ok=True)
doc = fitz.open(pdf_path)
print(f'pages={doc.page_count}')
for index, page in enumerate(doc):
    text = page.get_text('text')
    (out_dir / f'page-{index + 1}.txt').write_text(text, encoding='utf-8')
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    pix.save(out_dir / f'page-{index + 1}.png')
    print(f'page={index + 1} text_chars={len(text)} size={page.rect.width:.0f}x{page.rect.height:.0f}')
