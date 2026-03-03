---
name: liferay-server-cx
description: Expert guidance for creating server-side Liferay Client Extensions (Object Actions, Workflow Actions, and Proxy Objects) as microservices and deploying them on Liferay Cloud PaaS.
---

# Liferay Server-Side Client Extensions Skill

This skill provides expert procedural knowledge and best practices for scaffolding, configuring, and deploying Liferay Server-Side Client Extensions—specifically focusing on **Object Actions**, **Workflow Actions**, and **Proxy Objects**.

## Core Workflows

- **Object Actions (`objectAction`)**: Defining webhooks in `client-extension.yaml` to trigger external microservice logic based on Liferay Object events (On After Add, On Before Update, etc.).
- **Workflow Actions (`workflowAction`)**: Integrating external microservice logic into Liferay Workflow nodes to automate decisions and transitions (e.g., auto-approvals, AI processing).
- **Proxy Objects**: Architecting headless REST APIs that serve as the external storage backend for Liferay Proxy Objects, allowing Liferay to treat external data as native entities without persisting it locally.
- **Liferay Cloud PaaS Deployment**: Structuring the workspace to deploy both the client extension definitions (`.zip`) to the Liferay service and the backend microservices as standalone services using `LCP.json`.

## Architecture Preference: Node.js

For building demo microservices, **Node.js (with Express)** is the preferred and default framework over Spring Boot. 
- **Speed & Simplicity**: Scaffolding endpoints requires minimal boilerplate, keeping demo repositories clean and easy to explain.
- **Native JSON**: Liferay Client Extensions communicate via JSON payloads, which Node.js processes natively without complex object mapping.
- **Resource Efficiency**: Node.js containers have a significantly smaller memory footprint and faster startup times in Liferay Cloud PaaS compared to Java/Spring Boot.

*Note: Only use Spring Boot if the demo specifically requires an enterprise Java narrative or integration with heavy Java-based legacy systems.*

## References

Load these reference files into context as needed:

- **[LIFERAY_SERVER_CX_GUIDE.md](references/LIFERAY_SERVER_CX_GUIDE.md)**: Comprehensive guide on how to configure `client-extension.yaml`, build the backend microservice, and write the Liferay Cloud PaaS deployment descriptors.
