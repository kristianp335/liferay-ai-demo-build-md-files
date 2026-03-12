---
name: liferay-commerce-objects
description: Specialized workflows for Liferay Commerce and custom Object Definitions. Use when managing B2B catalogs, creating SKUs via API, or programmatically defining and publishing Liferay Objects.
---

# Liferay Commerce & Objects Skill

This skill provides the procedural knowledge needed to interact with Liferay's high-level Headless APIs for Commerce and custom Objects.

## Core Workflows

- **Object Management**: Programmatic creation, publication, and population of Liferay Object Definitions.
- **Commerce Operations**: Managing B2B catalogs, SKUs, categories, and image attachments via Headless API.
- **API Reliability**: Using `externalReferenceCode` (ERC) as the primary identifier for robust integration.

## STRICT EXECUTION PROTOCOL (MANDATORY READS)

You MUST NOT guess API endpoints or JSON payload structures. You MUST use the `read_file` tool to read the following reference documents BEFORE executing Python scripts or making API calls:

- **Commerce / Catalogs / Products**: You MUST read **[LIFERAY_COMMERCE_API_GUIDE.md](references/LIFERAY_COMMERCE_API_GUIDE.md)** before attempting to create products, update catalogs, or manage user roles and accounts.
- **Custom Objects**: You MUST read **[OBJECT_DEFINITION_CREATION_AND_POPULATION.md](references/OBJECT_DEFINITION_CREATION_AND_POPULATION.md)** before attempting to programmatically create or populate custom Liferay Objects.