# Guide: React Custom Element Client Extensions in Liferay Workspace

This document summarizes the verified configuration and project structure required to successfully build and deploy a React-based Custom Element Client Extension (CX) in a Liferay Workspace.

## 1. Project Structure
The project should follow the standard Create React App (CRA) structure:
```
client-extensions/[project-name]/
├── package.json
├── client-extension.yaml
├── bnd.bnd
├── public/
│   └── index.html
└── src/
    └── index.js
```

## 2. Configuration Files

### `package.json`
Use `react-scripts` for a reliable build process that Liferay Workspace can easily bundle.
```json
{
  "name": "my-react-form",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

### `client-extension.yaml`
Key requirements:
- **Assemble**: Must pull from `build/static` (CRA default) and place `into: static`.
- **URLs**: Use glob patterns (`main.*.js`) because CRA appends hashes to filenames.
- **Home Page URL**: Must include the protocol (e.g., `http://localhost:8080`) to avoid `NullPointerException` in Liferay's interpolation plugin.

```yaml
assemble:
    - from: build/static
      into: static

my-react-form:
    name: My React Form
    type: customElement
    friendlyURLMapping: my-react-form
    htmlElementName: my-react-form
    instanceable: true
    oAuth2ApplicationExternalReferenceCode: my-oauth-user
    portletCategoryName: category.client-extensions
    urls:
        - js/main.*.js
    cssUrls:
        - css/main.*.css
    useESM: true

my-oauth-user:
    name: My OAuth User Agent
    type: oAuthApplicationUserAgent
    homePageURL: http://localhost:8080
    scopes:
        - Liferay.Object.REST.everything
```

### `public/index.html`
A valid HTML5 shell is mandatory for `react-scripts build` to pass minification.
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>React Form</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## 3. React Source (`src/index.js`)
- **Global Liferay**: Use `/* global Liferay */` to satisfy ESLint.
- **Custom Element**: Define the element using the `htmlElementName` from the YAML.
- **Cleanup**: Implement `disconnectedCallback` to unmount the React root.

```javascript
/* global Liferay */
import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => (
    <div className="my-app">
        <h1>Hello from React!</h1>
    </div>
);

class MyCustomElement extends HTMLElement {
    connectedCallback() {
        if (!this.root) {
            this.root = createRoot(this);
        }
        this.root.render(<App />);
    }
    disconnectedCallback() {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }
}

const ELEMENT_ID = 'my-react-form';
if (!customElements.get(ELEMENT_ID)) {
    customElements.define(ELEMENT_ID, MyCustomElement);
}
```

## 4. Key Troubleshooting Lessons
1. **404 Errors**: Usually caused by mismatched `assemble` paths or missing `static/` prefixes in `urls`.
2. **Unexpected token '<'**: Occurs when Liferay serves the untranspiled `src/index.js` (JSX) instead of the compiled bundle. Check the `assemble` source directory.
3. **Build Failures**: `react-scripts` is stricter than `liferay-npm-scripts` regarding global variables (ESLint) and HTML validity.
4. **Project Grouping**: `frontend` and `batch` client extensions should be in separate projects to avoid Workspace SDK grouping constraints.
