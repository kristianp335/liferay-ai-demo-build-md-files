---
name: generate-images
description: Workflow management for Imagen 4 image generation and post-processing. Use when generating AI assets, enforcing aspect ratios (e.g. 16:9), changing resolutions (1K or 2K), or optimizing file sizes for web delivery.
---

# Generate Images Skill

This skill optimizes the workflow for using the `imagen-4.0-generate-001` model to generate and process visual assets for Liferay projects.

## Core Workflows

- **Image Generation**: Efficiently utilize the Imagen 4 model with descriptive prompts via Python REST API calls.
- **Aspect Ratio Enforcement**: Use the API's `aspectRatio` parameter natively or use Python (Pillow) to crop generated images into specific formats.
- **Resolution Control**: Change resolution sizes using the `sampleImageSize` parameter (prefer `1K` over `2K`).
- **Format Optimization**: Convert large PNG assets to compressed JPEGs or WebP for better web performance.
- **Icon & Pattern Generation**: Specialized instructions for UI elements and tiling backgrounds.

## References

Load this reference file for specific processing scripts:

- **[IMAGEN_4_GUIDE.md](references/IMAGEN_4_GUIDE.md)**: Contains API usage instructions, parameters, and Pillow-based Python scripts for cropping and resizing.