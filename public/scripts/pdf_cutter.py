from PyPDF2 import PdfReader, PdfWriter
import tkinter as tk
from tkinter import filedialog, simpledialog
import os

def split_pdf(input_path, pages_per_file=5):
    reader = PdfReader(input_path)
    total_pages = len(reader.pages)
    file_count = 1

    for start in range(0, total_pages, pages_per_file):
        writer = PdfWriter()
        end = min(start + pages_per_file, total_pages)

        for i in range(start, end):
            writer.add_page(reader.pages[i])

        output_filename = f"{file_count}.pdf"
        with open(output_filename, "wb") as out_file:
            writer.write(out_file)

        print(f"Saved: {output_filename} (Pages {start + 1}-{end})")
        file_count += 1

# --- Main Program ---
def main():
    # Create a hidden Tkinter root window
    root = tk.Tk()
    root.withdraw()

    # Ask for PDF file using a popup
    input_pdf = filedialog.askopenfilename(
        title="Select PDF File",
        filetypes=[("PDF files", "*.pdf")]
    )

    if not input_pdf:
        print("No file selected. Exiting.")
        return

    # Ask how many pages per split (default 5)
    pages_per_file = simpledialog.askinteger(
        "Split PDF",
        "How many pages per file?",
        initialvalue=5,
        minvalue=1
    )
    if pages_per_file is None:
        pages_per_file = 5

    # Run the splitter
    split_pdf(input_pdf, pages_per_file)

if __name__ == "__main__":
    main()
