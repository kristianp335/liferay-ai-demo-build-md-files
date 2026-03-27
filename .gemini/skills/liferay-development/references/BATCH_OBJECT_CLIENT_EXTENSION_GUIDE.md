# Guide: Batch Client Extensions for Object Initialization

This document summarizes the verified configuration and folder structure required to successfully initialize Liferay Objects and place them into custom folders using Batch Client Extensions (CX).

Batch CX should not be mixed with Custom Element CX in the same CX project or share the same client-extension.yaml.


## 1. Project Structure
The project should use the `assemble` block to bundle all definitions:
```
client-extensions/[project-name]/
├── client-extension.yaml
├── bnd.bnd
└── batch/
    ├── 01-00-folder-definition.batch-engine-data.json
    └── 01-01-object-definition.batch-engine-data.json
```

## 2. Configuration Patterns

### Execution Order
The Liferay Batch Engine processes files alphabetically. Use numeric prefixes to ensure dependencies are met:
- `01-00-...`: Folders (must exist before objects).
- `01-01-...`: Object Definitions.
- `02-00-...`: Relationships.
- `03-00-...`: Entries/Data.

### `client-extension.yaml`
Key requirements:
- **Assemble**: Copy the entire folder into `batch`.
- **OAuth Server**: Provide `.serviceAddress` and `.serviceScheme` to avoid validation errors.
- **Scopes**: Ensure at least `Liferay.Headless.Batch.Engine.everything` and `Liferay.Object.Admin.REST.everything` are included.

```yaml
assemble:
    - from: batch
      into: batch

my-batch-init:
    name: My Batch Initialization
    oAuthApplicationHeadlessServer: my-batch-oauth-server
    type: batch

my-batch-oauth-server:
    .serviceAddress: localhost:8080
    .serviceScheme: http
    name: My Batch OAuth Server
    scopes:
        - Liferay.Headless.Batch.Engine.everything
        - Liferay.Object.Admin.REST.everything
    type: oAuthApplicationHeadlessServer
```

### Folder Definition (`01-00-...json`)
Use the REST DTO class: `com.liferay.object.admin.rest.dto.v1_0.ObjectFolder`.
```json
{
  "configuration": {
    "className": "com.liferay.object.admin.rest.dto.v1_0.ObjectFolder",
    "parameters": {
      "createStrategy": "UPSERT",
      "updateStrategy": "UPDATE"
    }
  },
  "items": [
    {
      "name": "MyFolder",
      "label": { "en_US": "My Custom Folder" },
      "externalReferenceCode": "MY_CUSTOM_FOLDER_ERC"
    }
  ]
}
```

### Object Definition (`01-01-...json`)
Key fields for success:
- **`className`**: `com.liferay.object.admin.rest.dto.v1_0.ObjectDefinition`.
- **`objectFolderExternalReferenceCode`**: Link to the folder defined above.
- **`scope`**: `company` for system-wide, `site` for specific site.
- **`status`**: Must be `{"code": 0, "label": "approved"}` to be active immediately.
- **`enableCategorization`**: Set to `true` to allow Liferay Categories to be used with entries.
- **`objectFields`**: Ensure custom fields for commerce filtering have `indexed: true` and `indexedAsKeyword: true`.

### Data Population (`03-00-...json`)
When importing actual entries into a custom object, use the `ObjectEntry` DTO.

Key requirements:
- **`className`**: `com.liferay.object.rest.dto.v1_0.ObjectEntry`.
- **`taskItemDelegateName`**: Must match the **Object Name** (e.g., `C_MyObject`).
- **`externalReferenceCode`**: Crucial for `UPSERT` strategy to avoid duplicates and for linking to Commerce products.
- **`values`**: A dictionary containing the actual field names and their values.

#### Advanced Mapping Patterns
- **Relationships**: Use the format `r_[relName]To[Target]_[targetIdField]`. For batch, the value must be the **integer ID** of the related record (e.g., `38660`).
- **Dates**: Must use **ISO 8601** format with UTC 'Z' (e.g., `"2024-03-27T10:00:00Z"`).
- **Categorization**: Use `assetCategoryIds` (array of integers) or `assetTagNames` (array of strings) at the root of the item object (outside the `values` block) if `enableCategorization` is active.

```json
{
  "configuration": {
    "className": "com.liferay.object.rest.dto.v1_0.ObjectEntry",
    "parameters": {
      "taskItemDelegateName": "C_MyObject",
      "createStrategy": "UPSERT"
    }
  },
  "items": [
    {
      "externalReferenceCode": "ENTRY-001",
      "assetCategoryIds": [12345],
      "values": {
        "title": "Sample Entry 1",
        "r_accountToMyObject_accountEntryId": 38660,
        "timestamp": "2024-03-27T10:00:00Z"
      }
    }
  ]
}
```

## 3. Key Troubleshooting Lessons
1. **NPE during deployment**: Often caused by missing protocol (`http://`) in OAuth URLs or missing properties like `.serviceAddress`.
2. **Object not created**: Check if the `className` in the JSON `configuration` block exactly matches the REST DTO expected by the version of Liferay.
3. **Folder association**: Ensure the `externalReferenceCode` of the folder matches exactly what is provided in the object's `objectFolderExternalReferenceCode`.
4. **Site vs Company**: Site-scoped objects require a valid `scopeKey` (groupId) if the Batch Engine doesn't default correctly; `company` scope is more reliable for global definitions.
