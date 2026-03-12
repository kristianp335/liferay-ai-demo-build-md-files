---
name: liferay-admin
description: Procedural knowledge for Liferay workspace setup, deployment of collections/extensions, and Lighthouse performance optimization. Use for environment configuration, zipping collections, or resolving deployment issues.
---

# Liferay Administration & Deployment Skill

This skill handles the operational aspects of Liferay development, including setup, deployment, and optimization.

## Core Workflows

- **Workspace Setup**: Follow established patterns for workspace initialization and bundle management.
- **Deployment**: Correct procedures for packaging and importing fragment collections and client extensions.
- **Performance Optimization**: Techniques for achieving 90+ Lighthouse scores by optimizing LCP and CLS.
- **Rule Adherence**: Maintain compliance with Liferay versioning and project-specific rules.

## STRICT EXECUTION PROTOCOL (MANDATORY READS)

You MUST NOT rely on pre-existing Liferay knowledge regarding deployments or configuration. Your pre-trained knowledge is outdated or incorrect for this specific environment. You MUST use the `read_file` tool to read the following reference documents BEFORE executing any commands or finalizing a strategy:

- **Deploying/Zipping Fragments**: You MUST read **[LIFERAY_DEPLOYMENT_GUIDE.md](references/LIFERAY_DEPLOYMENT_GUIDE.md)** before attempting to ZIP or deploy a fragment collection or client extension. Standard shell zip tools do not work for Liferay fragment collections; you must follow the precise Python logic outlined in this guide.
- **Performance**: You MUST read **[LIFERAY_PERFORMANCE_OPTIMISATION_GUIDE.md](references/LIFERAY_PERFORMANCE_OPTIMISATION_GUIDE.md)** when tasked with improving Lighthouse or Web Vitals scores.
- **Workspace/Environment**: You MUST read **[INITIAL_SETUP_GUIDE.md](references/INITIAL_SETUP_GUIDE.md)** and **[LIFERAY_RULES.md](references/LIFERAY_RULES.md)** for workspace initialization and version-aware development logic.