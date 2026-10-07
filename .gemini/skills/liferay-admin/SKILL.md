---
name: liferay-admin
description: Procedural knowledge for Liferay workspace setup and Lighthouse performance optimization. Use for environment configuration or resolving performance issues.
---

# Liferay Administration & Performance Skill

This skill handles the operational aspects of Liferay development, specifically environment setup and performance optimization.

## Core Workflows

- **Workspace Setup**: Follow established patterns for workspace initialization and bundle management.
- **Performance Optimization**: Techniques for achieving 90+ Lighthouse scores by optimizing LCP and CLS.
- **Rule Adherence**: Maintain compliance with Liferay versioning and project-specific rules.
- **Cloud Deployments**: Operate on Liferay Cloud (LXC) projects via the `lcp` CLI.
- **Environment Management**: Handle promotion between local, Dev, UAT, and Prod.
- **Feature Flags**: Programmatically and manually toggle Liferay feature flags.

## STRICT EXECUTION PROTOCOL (MANDATORY READS)

You MUST NOT rely on pre-existing Liferay knowledge regarding deployments or configuration. Your pre-trained knowledge is outdated or incorrect for this specific environment. You MUST use the `read_file` tool to read the following reference documents BEFORE executing any commands or finalizing a strategy:

- **Performance**: You MUST read **[LIFERAY_PERFORMANCE_OPTIMISATION_GUIDE.md](references/LIFERAY_PERFORMANCE_OPTIMISATION_GUIDE.md)** when tasked with improving Lighthouse or Web Vitals scores.
- **Workspace/Environment**: You MUST read **[INITIAL_SETUP_GUIDE.md](references/INITIAL_SETUP_GUIDE.md)** and **[LIFERAY_RULES.md](references/LIFERAY_RULES.md)** for workspace initialization and version-aware development logic.
- **Cloud (LXC)**: You MUST read **[LXC_CLOUD_PROJECT_GUIDE.md](references/LXC_CLOUD_PROJECT_GUIDE.md)** when interacting with Liferay Cloud deployments using the `lcp` CLI.
- **Promotion/Config**: You MUST read **[ENVIRONMENT_PROMOTION_GUIDE.md](references/ENVIRONMENT_PROMOTION_GUIDE.md)** when managing configs or promoting between Dev, UAT, and Prod.
- **Feature Flags**: You MUST read **[FEATURE_FLAGS_GUIDE.md](references/FEATURE_FLAGS_GUIDE.md)** when an API requires a flag or when tasked with enabling new features.
- **Glowroot APM**: You MUST read **[GLOWROOT_PERFORMANCE_GUIDE.md](references/GLOWROOT_PERFORMANCE_GUIDE.md)** when diagnosing JVM/DB slowness or reading APM traces.
- **Analytics & AI Hub**: You MUST read **[MANAGE_ANALYTICS_GUIDE.md](references/MANAGE_ANALYTICS_GUIDE.md)** for connecting Liferay Data Platform (LDP) and **[MANAGE_AI_HUB_GUIDE.md](references/MANAGE_AI_HUB_GUIDE.md)** for AI Hub Cell configuration.