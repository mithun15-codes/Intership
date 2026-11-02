import json
import os
from pathlib import Path
import shutil
from concurrent.futures import ThreadPoolExecutor
import fitz  # PyMuPDF
import pytesseract

# Auto-configure tesseract path on Windows if not already in system PATH
if os.name == "nt" and not shutil.which("tesseract"):
    default_tesseract = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
    if default_tesseract.is_file():
        pytesseract.pytesseract.tesseract_cmd = str(default_tesseract)


class Pdf:
    """PDF Document OCR processing pipeline using PyMuPDF and Tesseract."""

    def __init__(self, file: str = "IEEE.pdf", count: int | None = None, output_dir: str | Path = "."):
        self.file = Path(file)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.t: list[dict] = []

        if count is not None:
            self.count = count
        else:
            with fitz.open(self.file) as doc:
                self.count = len(doc)

    def read_pdf(self) -> int:
        """Renders PDF pages into PNG images."""
        try:
            with fitz.open(self.file) as doc:
                total_pages = min(self.count, len(doc))
                for i in range(total_pages):
                    page = doc.load_page(i)
                    pix = page.get_pixmap()
                    image_path = self.output_dir / f"page_{i + 1}.png"
                    pix.save(str(image_path))

            self.count = total_pages
            print(f"PDF read successfully and {self.count} images generated")
            return self.count
        except Exception as e:
            print(f"Error reading PDF: {e}")
            raise

    def _ocr_page(self, page_num: int) -> list[dict]:
        """Runs OCR on a single page image file directly without PIL overhead."""
        image_path = self.output_dir / f"page_{page_num}.png"
        if not image_path.exists():
            raise FileNotFoundError(f"Image file not found: {image_path}")

        # pytesseract directly accepts file path strings without loading into PIL
        data = pytesseract.image_to_data(str(image_path), output_type=pytesseract.Output.DICT)

        page_data = []
        for i, text in enumerate(data.get("text", [])):
            clean_text = text.strip()
            if clean_text:
                page_data.append({
                    "page": page_num,
                    "text": clean_text,
                    "x": data["left"][i],
                    "y": data["top"][i],
                    "width": data["width"][i],
                    "height": data["height"][i]
                })

        # Save page-specific OCR results
        output_json = self.output_dir / f"output_{page_num}.json"
        with open(output_json, "w", encoding="utf-8") as file:
            json.dump(page_data, file, ensure_ascii=False, indent=4)

        return page_data

    def ocr(self, max_workers: int | None = None) -> list[dict]:
        """Runs OCR across all generated page images in parallel."""
        try:
            self.t = []
            page_numbers = list(range(1, self.count + 1))

            # Use ThreadPoolExecutor for concurrent OCR execution across CPU cores
            workers = max_workers or min(os.cpu_count() or 4, 8)
            with ThreadPoolExecutor(max_workers=workers) as executor:
                results = list(executor.map(self._ocr_page, page_numbers))

            for page_data in results:
                self.t.extend(page_data)

            print(f"JSON files saved successfully for {self.count} pages")
            return self.t
        except Exception as e:
            print(f"Error performing OCR: {e}")
            raise

    def process(self) -> list[dict]:
        """Convenience method to execute full pipeline."""
        self.read_pdf()
        return self.ocr()


if __name__ == "__main__":
    pdf_pipeline = Pdf(file="IEEE.pdf")
    pdf_pipeline.read_pdf()
    pdf_pipeline.ocr()
