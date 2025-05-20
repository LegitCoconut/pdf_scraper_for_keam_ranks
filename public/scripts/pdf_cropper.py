import fitz  # PyMuPDF
import cv2
import numpy as np

# --- Step 1: Let user draw crop area on the first page ---

def select_crop_area(image_path):
    global ref_point, cropping, clone

    ref_point = []
    cropping = False
    clone = None

    def click_and_crop(event, x, y, flags, param):
        global ref_point, cropping, clone

        if event == cv2.EVENT_LBUTTONDOWN:
            ref_point = [(x, y)]
            cropping = True

        elif event == cv2.EVENT_LBUTTONUP:
            ref_point.append((x, y))
            cropping = False
            cv2.rectangle(clone, ref_point[0], ref_point[1], (0, 255, 0), 2)
            cv2.imshow("Select Crop Area", clone)

    image = cv2.imread(image_path)
    clone = image.copy()
    cv2.namedWindow("Select Crop Area")
    cv2.setMouseCallback("Select Crop Area", click_and_crop)

    while True:
        cv2.imshow("Select Crop Area", clone)
        key = cv2.waitKey(1) & 0xFF

        if key == 13 or key == 27:  # Enter or ESC to finish
            break

    cv2.destroyAllWindows()

    if len(ref_point) == 2:
        x1, y1 = ref_point[0]
        x2, y2 = ref_point[1]
        return min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2)
    else:
        return None


# --- Step 2: Convert first PDF page to image for selection ---

def save_first_page_as_image(pdf_path, image_path="first_page.png"):
    doc = fitz.open(pdf_path)
    pix = doc[0].get_pixmap()
    pix.save(image_path)
    doc.close()


# --- Step 3: Crop all pages using selected area ---

def crop_pdf_all_pages(pdf_path, output_path, crop_rect):
    doc = fitz.open(pdf_path)
    for page in doc:
        page.set_cropbox(crop_rect)
    doc.save(output_path)
    doc.close()


# --- Main ---

pdf_file = "set2.pdf"
output_file = "cropped_output.pdf"

save_first_page_as_image(pdf_file)
rect = select_crop_area("first_page.png")

if rect:
    x1, y1, x2, y2 = rect
    # PyMuPDF uses points (not pixels), but this will be enough for most cases.
    crop_pdf_all_pages(pdf_file, output_file, fitz.Rect(x1, y1, x2, y2))
    print(f"PDF cropped and saved to {output_file}")
else:
    print("No crop area selected.")
