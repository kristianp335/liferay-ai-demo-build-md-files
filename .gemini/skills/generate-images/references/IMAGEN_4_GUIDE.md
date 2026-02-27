# Imagen 4 - Image Generation Instructions

This file contains specific instructions for the `imagen-4.0-generate-001` model when generating, editing, and restoring images via the Gemini REST API.

## Core API Usage

### 1. Generating Images via Python
Use the following Python template to call the Gemini API for image generation. The API key should be passed securely (e.g., from `os.environ.get("GEMINI_API_KEY")` or `NANOBANANA_GEMINI_API_KEY`).

```python
import os
import requests
import base64

api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("NANOBANANA_GEMINI_API_KEY")
url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key={api_key}"

payload = {
    "instances": [
        {"prompt": "A futuristic city with neon lights, 8k resolution, photorealistic"}
    ],
    "parameters": {
        "sampleCount": 1,
        "aspectRatio": "16:9",
        "sampleImageSize": "1K"
    }
}

response = requests.post(url, json=payload)

if response.status_code == 200:
    data = response.json()
    predictions = data.get('predictions', [])
    if predictions:
        image_b64 = predictions[0].get('bytesBase64Encoded')
        if image_b64:
            with open("generated_image.png", "wb") as f:
                f.write(base64.b64decode(image_b64))
            print("Successfully saved generated_image.png")
else:
    print(f"Error {response.status_code}: {response.text}")
```

### 2. Supported Parameters
*   **`sampleCount`**: The number of images to generate (1 to 4). **CRITICAL:** Always generate the precise count requested by the user.
*   **`aspectRatio`**: Native aspect ratios supported are `"1:1"`, `"3:4"`, `"4:3"`, `"9:16"`, and `"16:9"`.
*   **`sampleImageSize`**: Controls the resolution.
    *   `"1K"` (Default): High resolution (e.g., 1024x1024 for 1:1, 1408x768 for 16:9).
    *   `"2K"`: Ultra-high resolution (e.g., 2048x2048 for 1:1, 2816x1536 for 16:9).

## Image Manipulation with Python (Pillow)

While the API natively supports aspect ratios, you will often need to crop or resize generated images for specific uses, especially within Liferay fragments that require particular dimensions (e.g., 300x500 pixels). Python's Pillow library is recommended for this task.

**Installation:**
```bash
pip install Pillow
```

**1. Cropping to a Specific Size (e.g., 300x500 pixels)**

This script crops an image to a target width and height, centered within the original image.

```python
from PIL import Image
import os

def crop_to_size(image_path, target_width, target_height, output_path):
    with Image.open(image_path) as img:
        original_width, original_height = img.size

        # If target size is larger than original, resize original up to target,
        # then proceed with cropping from the center.
        if target_width > original_width or target_height > original_height:
            print(f"Warning: Target size ({target_width}x{target_height}) is larger than original ({original_width}x{original_height}). Resizing original image up.")
            img = img.resize((max(original_width, target_width), max(original_height, target_height)), Image.LANCZOS)
            original_width, original_height = img.size

        # Calculate coordinates for a center crop
        left = (original_width - target_width) / 2
        top = (original_height - target_height) / 2
        right = left + target_width
        bottom = top + target_height

        # Ensure coordinates are integers
        left, top, right, bottom = int(left), int(top), int(right), int(bottom)

        cropped_img = img.crop((left, top, right, bottom))
        cropped_img.save(output_path)
    print(f"Image cropped to {cropped_img.size[0]}x{cropped_img.size[1]} and saved to {output_path}")

# --- Usage Example ---
# crop_to_size('generated_image.png', 300, 500, 'cropped_image_300x500.png')
```

**2. Cropping to a Specific Aspect Ratio (e.g., 16:9 Landscape)**

This script calculates the largest possible rectangle with the target aspect ratio that fits within the original image, and then crops that centered rectangle. (Useful if the API output needs secondary framing).

```python
from PIL import Image
import os

def crop_to_aspect_ratio(image_path, target_aspect_ratio, output_path):
    with Image.open(image_path) as img:
        original_width, original_height = img.size

        if original_width / original_height > target_aspect_ratio:
            # Original is wider than target aspect, height is limiting factor
            crop_height = original_height
            crop_width = int(original_height * target_aspect_ratio)
        else:
            # Original is taller or same aspect, width is limiting factor
            crop_width = original_width
            crop_height = int(original_width / target_aspect_ratio)

        # Calculate coordinates for a center crop
        left = (original_width - crop_width) / 2
        top = (original_height - crop_height) / 2
        right = left + crop_width
        bottom = top + crop_height
        
        # Ensure coordinates are integers
        left, top, right, bottom = int(left), int(top), int(right), int(bottom)

        cropped_img = img.crop((left, top, right, bottom))
        cropped_img.save(output_path)
    print(f"Image cropped to dimensions {cropped_img.size[0]}x{cropped_img.size[1]} with aspect ratio {target_aspect_ratio:.2f} and saved to {output_path}")

# --- Usage Example ---
# crop_to_aspect_ratio('generated_image.png', 16 / 9, 'landscape_16_9.png')
```

## Quality Standards

- **Text Accuracy**: `imagen-4.0-generate-001` excels at text rendering. Ensure any text specified in the prompt is accurately placed, spelled correctly, and readable.
- **Consistency**: When generating multi-panel images or stories, ensure stylistic consistency.
- **Accuracy**: Never add unrelated words, phrases, or content not specified in the prompt.
