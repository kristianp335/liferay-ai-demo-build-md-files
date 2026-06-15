---
name: generate-images
description: Workflow management for Imagen 4 image generation and post-processing. Use when generating AI assets, enforcing aspect ratios (e.g. 16:9), changing resolutions (1K or 2K), or optimizing file sizes for web delivery.
---

# Generate Images Skill

This skill optimizes the workflow for using the `gemini-3.1-flash-image` model to generate and process visual assets for Liferay projects.

## Core Workflows

- **Image Generation**: Efficiently utilize the Gemini 3.1 Flash Image model with descriptive prompts via Python REST API calls.
- **Aspect Ratio Enforcement**: Use the API's `aspectRatio` parameter natively or use Python (Pillow) to crop generated images into specific formats.
- **Resolution Control**: Change resolution sizes using the `sampleImageSize` parameter (prefer `1K` over `2K`).
- **Format Optimization**: Convert large PNG assets to compressed JPEGs or WebP for better web performance.
- **Icon & Pattern Generation**: Specialized instructions for UI elements and tiling backgrounds.

## STRICT EXECUTION PROTOCOL (MANDATORY READS)

You MUST NOT attempt to write API calls to the model from memory. You MUST use the `read_file` tool to read the following reference document BEFORE generating images:

- **Gemini Flash Image API Usage**: You MUST read **[GEMINI_3_1_FLASH_IMAGE_GUIDE.md](references/GEMINI_3_1_FLASH_IMAGE_GUIDE.md)** to obtain the correct Python script templates, endpoint URLs, and valid parameter configurations (e.g., `aspectRatio`, `sampleImageSize`).