# Gemini 3.1 Flash Image Guide

This file contains specific instructions and guidelines for using the `gemini-3.1-flash-image` model (Nano Banana 2) when generating, editing, and processing images via the Gemini REST API.

## Model Specifications
- **Model ID:** `gemini-3.1-flash-image`
- **Supported Methods:** `generateContent`, `batchGenerateContent`
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key={api_key}`

## Core Capabilities
- **High-Speed Generation:** Cost-effective, low-latency image generation.
- **Search Grounding:** Supports Google Image Search Grounding to generate real-world entities accurately.
- **Thinking Levels:** Can be configured to reason through complex layout or label instructions (e.g., `thinkingLevel: "high"` or `"minimal"`).
- **Text Rendering:** Excellent handling of internationalized (i18n) text rendered within images.
- **Aspect Ratios:** Supports up to 15 different aspect ratios (e.g., `16:9`, `1:1`, `9:16`, `21:9`) and extreme aspect ratios like `4:1` or `1:8`.
- **Resolutions:** Supports 512p (0.5K), 1K, 2K, and 4K (preview) outputs.

## Python REST API Implementation Template

Unlike the legacy `imagen-4.0-generate-001:predict` endpoint, `gemini-3.1-flash-image` uses the standard `generateContent` JSON structure. Image data is returned as an `inlineData` part in the response.

```python
import os
import requests
import base64

def generate_image(prompt, filename, aspect_ratio="16:9", size="1K", thinking_level="minimal"):
    api_key = os.environ.get("GEMINI_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key={api_key}"
    
    # Pass configuration hints directly in the text prompt to ensure the model adheres to constraints
    full_prompt = f"{prompt}. Aspect Ratio: {aspect_ratio}, Size: {size}, Thinking Level: {thinking_level}."
    
    payload = {
        "contents": [
            {
                "parts": [{"text": full_prompt}]
            }
        ]
    }
    
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        data = response.json()
        candidates = data.get('candidates', [])
        if candidates:
            parts = candidates[0].get('content', {}).get('parts', [])
            for part in parts:
                if 'inlineData' in part:
                    image_b64 = part['inlineData'].get('data', '')
                    if image_b64:
                        with open(filename, "wb") as f:
                            f.write(base64.b64decode(image_b64))
                        print(f"Successfully generated {filename}")
                        return True
    return False
```

## Best Practices
1. **Aspect Ratio Enforcement:** Since `aspectRatio` isn't currently a direct JSON property in the public beta payload, include the desired aspect ratio explicitly at the end of the text prompt.
2. **Thinking Level:** Use the prompt instructions or reasoning parameters to adjust model complexity. For simple tasks, use minimal thinking to reduce latency.
3. **Text Accuracy:** The flash model excels at text rendering. If specific text must appear in the image, put it in quotes in your prompt.
