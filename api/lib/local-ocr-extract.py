import argparse
import json
import os
import subprocess
import sys
import tempfile

from pypdf import PdfReader
from pdf2image import convert_from_path


def extract_pdf_text(path: str):
    pages = []
    try:
        reader = PdfReader(path)
        for page in reader.pages:
            text = page.extract_text() or ""
            pages.append(text.strip())
    except Exception:
        return []
    return pages


def ocr_image(image_path: str, tesseract_path: str):
    result = subprocess.run(
        [tesseract_path, image_path, "stdout", "--psm", "6"],
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout.strip()


def ocr_pdf_pages(path: str, poppler_path: str, tesseract_path: str, max_pages: int):
    images = convert_from_path(
        path,
        dpi=250,
        first_page=1,
        last_page=max_pages,
        poppler_path=poppler_path,
    )
    pages = []
    with tempfile.TemporaryDirectory() as temp_dir:
        for index, image in enumerate(images, start=1):
            image_path = os.path.join(temp_dir, f"page-{index}.png")
            image.save(image_path, "PNG")
            pages.append(ocr_image(image_path, tesseract_path))
    return pages


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path")
    parser.add_argument("--poppler", required=True)
    parser.add_argument("--tesseract", required=True)
    parser.add_argument("--max-pages", type=int, default=25)
    args = parser.parse_args()

    path = args.path
    suffix = os.path.splitext(path)[1].lower()

    pages = []
    method = "unknown"

    if suffix == ".pdf":
      pages = extract_pdf_text(path)
      combined = "\n\n".join(pages).strip()
      if len(combined) >= 200:
          method = "pdf_text"
      else:
          pages = ocr_pdf_pages(path, args.poppler, args.tesseract, args.max_pages)
          method = "pdf_image_ocr"
    else:
      pages = [ocr_image(path, args.tesseract)]
      method = "image_ocr"

    text = "\n\n".join(page for page in pages if page)
    json.dump({"method": method, "pages": pages, "text": text}, sys.stdout)


if __name__ == "__main__":
    main()
