# Liferay OAuth2.0 Client in Fragments Guide

This guide details how to securely use the Liferay OAuth2.0 client module (`@liferay/oauth2-provider-web/client`) from within a Liferay Fragment to make authenticated requests to an external API or microservice.

## Overview

When building interactive fragments (like a Chatbot or a data dashboard) that need to communicate with an external API (like a Node.js Client Extension service deployed on Liferay Cloud), you must authenticate the user.

Instead of passing user credentials or managing session tokens manually, Liferay provides a secure, built-in mechanism to generate an OAuth2 Bearer token on behalf of the current logged-in user.

## Prerequisites

Before writing the JavaScript in your fragment, ensure you have an **OAuth2 User Agent Application** defined in a `client-extension.yaml` file that your Liferay instance is aware of.

Example `client-extension.yaml` entry:
```yaml
my-chat-oauth-app:
    .serviceAddress: mychatserver-myenv.lfr.cloud
    .serviceScheme: https
    name: My Chat OAuth App
    type: oAuthApplicationUserAgent
    scopes:
        - Liferay.Headless.Admin.User.everything
        - Liferay.Object.REST.everything
```
*Note: The key `my-chat-oauth-app` is the External Reference Code (ERC) you will use in your fragment code.*

## 1. Importing the Module

At the very top of your fragment's `index.js` file, import the Liferay OAuth2 Client module using ES module syntax.

```javascript
// Import the Liferay OAuth2 Client module
import * as OAuth2Client from '@liferay/oauth2-provider-web/client';
```

## 2. Initializing the Client

Inside your fragment's initialization logic (e.g., inside an `async function`), instantiate the client using the `FromUserAgentApplication` method, passing the External Reference Code (ERC) of your OAuth application defined in the YAML file.

```javascript
// 1. Initialize the OAuth2 client using the ES module
const oauth2Client = await OAuth2Client.FromUserAgentApplication('my-chat-oauth-app');
```

## 3. Making the Request to a Client Extension (The `fetch` Method)

The `oauth2Client` instance provides its own `.fetch()` method. 

**The Architectural Pattern:**
1. Your Fragment calls your Server-Side Client Extension (e.g., `https://my-node-app-prd.lfr.cloud/api/ask`).
2. The `oauth2Client.fetch()` automatically intercepts this call and injects an `Authorization: Bearer <token>` header containing a JWT representing the Liferay user.
3. Your Server-Side Client Extension receives the request, extracts the Bearer token, and uses it to securely call Liferay's core Headless APIs (e.g., fetching documents or updating objects) as that specific user.

**Crucial Detail:** You DO NOT need to manually get the token or set the header in your fragment. The `.fetch()` method handles the token generation, caching, injection, and renewal automatically.

```javascript
// This URL points to your deployed Server-Side Client Extension
const API_URL = 'https://my-node-app-prd.lfr.cloud/api/ask';

// 2. Use the oauth2Client's fetch method to call your microservice
const data = await oauth2Client.fetch(API_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        message: "Hello world"
    })
});
```

## 4. Parsing the Response (Important Distinction)

**CRITICAL DIFFERENCE:** The `oauth2Client.fetch()` method does NOT return a standard browser `Response` object. 

Liferay's implementation automatically parses the JSON body for you. It returns the resulting data object directly.

**Incorrect (Standard Fetch approach):**
```javascript
// THIS WILL FAIL
const response = await oauth2Client.fetch(API_URL, {...});
if (!response.ok) { // Error: response.ok is undefined
    const text = await response.text(); // Error: response.text is not a function
}
const data = await response.json(); // Error: response.json is not a function
```

**Correct (Liferay OAuth2Client approach):**
```javascript
// THIS IS CORRECT
const data = await oauth2Client.fetch(API_URL, {...});

// Check for application-level errors returned by your API
if (data && data.error) {
    console.error('API Error Response Body:', data.error);
    throw new Error(`API Error: ${data.error}`);
}

// Access your data directly
console.log("Success! Reply:", data.reply);
```

## Complete Example

```javascript
import * as OAuth2Client from '@liferay/oauth2-provider-web/client';

async function sendData() {
    try {
        const oauth2Client = await OAuth2Client.FromUserAgentApplication('my-chat-oauth-app');
        
        const data = await oauth2Client.fetch('https://mychatserver-myenv.lfr.cloud/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Hello!" })
        });

        if (data && data.error) {
            throw new Error(`Server returned error: ${data.error}`);
        }

        console.log('Received reply:', data.reply);
        
    } catch (error) {
        console.error('OAuth2 Request Failed:', error);
    }
}
```