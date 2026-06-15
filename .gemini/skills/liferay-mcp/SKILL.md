<skill>

# liferay-mcp

## Description
Expert guidance for interacting with the Liferay MCP Server. Use this skill to correctly discover, inspect, and invoke Liferay Headless, Object, and Commerce APIs.

## Instructions
1. **Three-Step API Integration Flow**:
   - **Step 1: Discovery**: Call `mcp_liferay-mcp_get-openapis` to discover the correct service path prefix and endpoint YAML URL.
   - **Step 2: Inspection**: Use `mcp_liferay-mcp_get-openapi` with the discovered YAML URL to inspect path parameters, payload schemas, and HTTP methods.
   - **Step 3: Execution**: Use `mcp_liferay-mcp_call-http-endpoint` to call the endpoint.
2. **Tool Constraints**:
   - **Path Parameter**: The path parameter for `call-http-endpoint` must be relative to the Liferay context prefix (e.g., `/headless-object/v1.0/object-definitions`). Do not include the host name or duplicate the leading `/o`.
   - **No Batch Calls**: Never call batch or bulk endpoints via `call-http-endpoint` to prevent timeouts or performance impact; perform individual operations instead.
3. **Environment Setup & Configuration**:
   - **Authentication**: Set the `LIFERAY_MCP_BASIC_AUTH` environment variable in your `.env` file to your Base64 encoded credentials (`email:password`).
   - **MCP Endpoint**: Set the `LIFERAY_MCP_URL` environment variable in your `.env` file to your target Liferay MCP server gateway URL (e.g., `http://localhost:8080/o/mcp`).
4. **Environment Safety**:
   - Be extremely cautious when executing mutating operations. Confirm the targeted environment configured via `$LIFERAY_MCP_URL` before running destructive commands.

## Key Endpoint Directory (Quick-Reference)
- **Objects & Data Modeling**:
  - Definition/Admin: `/object-admin/v1.0`
  - Instance CRUD: `/headless-object/v1.0`
- **Liferay Commerce**:
  - Catalog Admin: `/headless-commerce-admin-catalog/v1.0`
  - Pricing Admin: `/headless-commerce-admin-pricing/v2.0`
  - Delivery Catalog: `/headless-commerce-delivery-catalog/v1.0`
  - Cart: `/headless-commerce-delivery-cart/v1.0`
  - Orders: `/headless-commerce-delivery-order/v1.0`
- **Content & Portal Management**:
  - Web Contents / Documents: `/headless-delivery/v1.0`
  - Fragments Admin: `/headless-admin-fragment/v1.0`

</skill>