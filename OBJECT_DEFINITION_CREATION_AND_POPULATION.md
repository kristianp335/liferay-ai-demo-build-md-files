# Liferay Object Creation and Population Guide

## Overview
This guide provides comprehensive instructions on how to programmatically create a Liferay Object definition, publish it, and then populate it with entries using Liferay's Headless Admin Objects API. This process is essential for automating the management of custom data structures within Liferay DXP.

## Prerequisites
*   Access to a Liferay DXP 7.4+ instance.
*   Liferay user credentials with permissions to create and manage Objects.
*   Python 3.x installed.
*   `requests` Python library (`pip install requests`).

## Key Concepts
*   **Object Definition**: The schema or structure of your custom data entity in Liferay.
*   **Object Entry**: An instance of data conforming to an Object Definition.
*   **`externalReferenceCode` (ERC)**: A unique identifier for Liferay entities, crucial for API interactions.
*   **`restContextPath`**: The API endpoint for interacting with an object's entries, found in the object definition.
*   **Publishing**: Making an Object Definition active and available for entry creation.

## Step 1: Create the Liferay Object Definition

This step involves defining the structure of your custom object (e.g., fields like `sender`, `recipient`, `subject`, `body`, `timestamp`, `emailActionType`).

### `create_email_object.py` Script

```python
import requests
import json
import os
import uuid

# --- Configuration ---
# User-provided Liferay instance details
LIFERAY_HOST = "https://webserver-lctbootsopticians-prd.lfr.cloud"
LIFERAY_USERNAME = "nick@boots.com"
LIFERAY_PASSWORD = "Gloria1234!"
COMPANY_ID = os.getenv("COMPANY_ID", "20123") # Default Liferay company ID

# --- Object Definition Payload ---
email_object_definition = {
    "accountEntryRestricted": False,
    "active": True,
    "defaultLanguageId": "en_US",
    "enableCategorization": True,
    "enableComments": True,
    "enableIndexSearch": True,
    "enableLocalization": False,
    "enableObjectEntryDraft": True,
    "enableObjectEntryHistory": True,
    "externalReferenceCode": str(uuid.uuid4()), # Unique ERC for the object definition
    "label": {
        "en_US": "Email"
    },
    "name": "Email",
    "pluralLabel": {
        "en_US": "Emails"
    },
    "panelCategoryKey": "control_panel.users",
    "portlet": True,
    "scope": "company",
    "system": False,
    "titleObjectFieldName": "subject", # Use 'subject' as the title field for entries
    "objectFields": [
        {
            "DBType": "String",
            "businessType": "Text",
            "externalReferenceCode": str(uuid.uuid4()),
            "label": {"en_US": "Sender"},
            "name": "sender",
            "required": True,
            "indexed": True,
            "indexedAsKeyword": False,
            "system": False,
            "type": "String",
            "unique": False
        },
        {
            "DBType": "String",
            "businessType": "Text",
            "externalReferenceCode": str(uuid.uuid4()),
            "label": {"en_US": "Recipient"},
            "name": "recipient",
            "required": True,
            "indexed": True,
            "indexedAsKeyword": False,
            "system": False,
            "type": "String",
            "unique": False
        },
        {
            "DBType": "String",
            "businessType": "Text",
            "externalReferenceCode": str(uuid.uuid4()),
            "label": {"en_US": "CC"},
            "name": "cc",
            "required": False,
            "indexed": False,
            "indexedAsKeyword": False,
            "system": False,
            "type": "String",
            "unique": False
        },
        {
            "DBType": "String",
            "businessType": "Text",
            "externalReferenceCode": str(uuid.uuid4()),
            "label": {"en_US": "BCC"},
            "name": "bcc",
            "required": False,
            "indexed": False,
            "indexedAsKeyword": False,
            "system": False,
            "type": "String",
            "unique": False
        },
        {
            "DBType": "String",
            "businessType": "Text", # Liferay generally handles longer text for 'Text' fields, or you can use 'LongText' if available in your version for truly massive amounts of text.
            "externalReferenceCode": str(uuid.uuid4()),
            "label": {"en_US": "Subject"},
            "name": "subject",
            "required": True,
            "indexed": True,
            "indexedAsKeyword": False,
            "system": False,
            "type": "String",
            "unique": False
        },
        {
            "DBType": "String",
            "businessType": "LongText", # Using LongText for email body
            "externalReferenceCode": str(uuid.uuid4()),
            "label": {"en_US": "Body"},
            "name": "body",
            "required": True,
            "indexed": False,
            "indexedAsKeyword": False,
            "system": False,
            "type": "String",
            "unique": False
        },
        {
            "DBType": "Date",
            "businessType": "Date",
            "externalReferenceCode": str(uuid.uuid4()),
            "label": {"en_US": "Timestamp"},
            "name": "timestamp",
            "required": True,
            "indexed": True,
            "indexedAsKeyword": False,
            "system": False,
            "type": "Date",
            "unique": False
        },
        {
            "DBType": "String",
            "businessType": "Text", # Use Keyword for controlled vocabulary/faceting
            "externalReferenceCode": str(uuid.uuid4()),
            "label": {"en_US": "Email Action Type"},
            "name": "emailActionType",
            "required": True,
            "indexed": True,
            "indexedAsKeyword": True, # Important for filtering/searching on this field
            "system": False,
            "type": "String",
            "unique": False
        }
    ]
}

# --- API Call ---
def create_email_object():
    url = f"{LIFERAY_HOST}/o/object-admin/v1.0/object-definitions" # Updated endpoint
    headers = {
        "Content-Type": "application/json",
    }
    auth = (LIFERAY_USERNAME, LIFERAY_PASSWORD)

    print(f"Attempting to create Liferay Email Object at {url}")
    try:
        response = requests.post(url, headers=headers, auth=auth, data=json.dumps(email_object_definition))
        response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)

        response_json = response.json()
        print("Liferay Email Object created successfully!")
        print(f"Object Name: {response_json.get('name')}")
        print(f"Object ID: {response_json.get('id')}")
        print(f"Object ERC: {response_json.get('externalReferenceCode')}")
        return response_json
    except requests.exceptions.HTTPError as e:
        print(f"Error creating Liferay Email Object: {e.response.status_code} - {e.response.text}")
    except requests.exceptions.ConnectionError as e:
        print(f"Connection Error: Could not connect to Liferay at {LIFERAY_HOST}. Is the server running and accessible?")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    return None

if __name__ == "__main__":
    new_object = create_email_object()
    if new_object:
        # Save the object definition for future reference, especially its ID and ERC
        with open(f".gemini/Object_Definition_{new_object['name']}_{new_object['id']}.json", "w") as f:
            json.dump(new_object, f, indent=2)
        print(f"Saved object definition to .gemini/Object_Definition_{new_object['name']}_{new_object['id']}.json")
```

### Explanation
*   **`LIFERAY_HOST`, `LIFERAY_USERNAME`, `LIFERAY_PASSWORD`**: Replace these with your Liferay instance details and credentials.
*   **`email_object_definition`**: A JSON dictionary defining the object's metadata (`name`, `label`, `pluralLabel`, `externalReferenceCode`) and its `objectFields`.
    *   Each `objectField` specifies `DBType`, `businessType`, `name`, `label`, `required`, `indexed`, `indexedAsKeyword`, etc.
    *   `businessType: "Text"` combined with `indexedAsKeyword: True` is used for fields like `emailActionType` to provide keyword-like behavior for filtering and searching.
    *   `businessType: "LongText"` is used for fields that will contain longer text content, such as the email `body`.
*   **API Endpoint**: `POST /o/object-admin/v1.0/object-definitions` is used to create the object definition.

### How to Run
1.  Save the script as `create_email_object.py` in your project's root directory.
2.  Update `LIFERAY_HOST`, `LIFERAY_USERNAME`, `LIFERAY_PASSWORD` in the script.
3.  Execute the script: `python create_email_object.py`
4.  Upon successful creation, note the `Object ID` and `Object ERC` from the output. The script also saves the full object definition to a `.gemini/Object_Definition_Email_{ID}.json` file for your records.

## Step 2: Publish the Liferay Object Definition

Before you can add entries to an object, its definition must be published.

### `publish_email_object.py` Script

```python
import requests
import json
import os

# --- Configuration ---
LIFERAY_HOST = "https://webserver-lctbootsopticians-prd.lfr.cloud"
LIFERAY_USERNAME = "nick@boots.com"
LIFERAY_PASSWORD = "Gloria1234!"

# Object ID of the Email object created previously
OBJECT_DEFINITION_ID = 156560 # From previous output

# --- Publish Object Function ---
def publish_email_object():
    url = f"{LIFERAY_HOST}/o/object-admin/v1.0/object-definitions/{OBJECT_DEFINITION_ID}/publish"
    headers = {
        "Content-Type": "application/json",
    }
    auth = (LIFERAY_USERNAME, LIFERAY_PASSWORD)

    print(f"Attempting to publish Liferay Email Object (ID: {OBJECT_DEFINITION_ID}) at {url}")
    try:
        response = requests.post(url, headers=headers, auth=auth)
        response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)

        # The /publish endpoint might return a simplified success or the updated object.
        # We'll check the object status explicitly after publishing to confirm.
        print(f"Successfully sent publish request for Email Object (ID: {OBJECT_DEFINITION_ID}).")
        
        # Verify status by fetching the object definition again
        verify_url = f"{LIFERAY_HOST}/o/object-admin/v1.0/object-definitions/{OBJECT_DEFINITION_ID}"
        verify_response = requests.get(verify_url, headers=headers, auth=auth)
        verify_response.raise_for_status()
        verify_json = verify_response.json()

        if verify_json.get('status', {}).get('code') == 0:
            print(f"Liferay Email Object (ID: {OBJECT_DEFINITION_ID}) is now published (Status: {verify_json.get('status', {}).get('label')})!")
            return True
        else:
            print(f"Publication request sent, but object status is still not 'approved'. Current status: {verify_json.get('status', {}).get('label')}")
            return False
    except requests.exceptions.HTTPError as e:
        print(f"Error publishing Liferay Email Object: {e.response.status_code} - {e.response.text}")
    except requests.exceptions.ConnectionError as e:
        print(f"Connection Error: Could not connect to Liferay at {LIFERAY_HOST}. Is the server running and accessible?")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    return False

if __name__ == "__main__":
    publish_email_object()
```

### Explanation
*   **`OBJECT_DEFINITION_ID`**: The ID of the object definition obtained from Step 1.
*   **API Endpoint**: A `POST` request to `o/object-admin/v1.0/object-definitions/{OBJECT_DEFINITION_ID}/publish` is used to publish the object definition. This dedicated endpoint ensures the object status is correctly updated from `draft` to `approved`.
*   The script includes a verification step to confirm the object's status after the publish request.

### How to Run
1.  Save the script as `publish_email_object.py`.
2.  Ensure `OBJECT_DEFINITION_ID` is correctly set in the script.
3.  Execute the script: `python publish_email_object.py`
4.  Confirm the output indicates successful publication.

## Step 3: (Optional) Delete Existing Object Entries

This script is useful if you need to clear an object's entries before repopulating, for example, during development or testing.

### `delete_email_records.py` Script

```python
import requests
import json
import os

# --- Configuration ---
LIFERAY_HOST = "https://webserver-lctbootsopticians-prd.lfr.cloud"
LIFERAY_USERNAME = "nick@boots.com"
LIFERAY_PASSWORD = "Gloria1234!"

# Object ID of the Email object
OBJECT_DEFINITION_ID = 156560
REST_CONTEXT_PATH = "/o/c/emails"

# --- Function to delete all email records ---
def delete_all_email_records():
    # Endpoint to get all entries
    get_entries_url = f"{LIFERAY_HOST}{REST_CONTEXT_PATH}"
    
    headers = {
        "Content-Type": "application/json",
    }
    auth = (LIFERAY_USERNAME, LIFERAY_PASSWORD)

    print(f"Attempting to fetch and delete all email records from {get_entries_url}")

    while True: # Loop to handle pagination
        try:
            response = requests.get(get_entries_url, headers=headers, auth=auth)
            response.raise_for_status()
            entries = response.json().get("items", [])

            if not entries:
                print("No more entries found. All records processed or none existed.")
                break

            print(f"Found {len(entries)} entries. Deleting...")

            for entry in entries:
                entry_id = entry.get("id")
                if not entry_id:
                    print(f"Skipping entry with no ID: {entry}")
                    continue

                delete_entry_url = f"{get_entries_url}/{entry_id}"
                try:
                    delete_response = requests.delete(delete_entry_url, headers=headers, auth=auth)
                    delete_response.raise_for_status()
                    print(f"Successfully deleted entry ID: {entry_id}")
                except requests.exceptions.HTTPError as e:
                    print(f"Error deleting entry ID {entry_id}: {e.response.status_code} - {e.response.text}")
                except Exception as e:
                    print(f"An unexpected error occurred while deleting entry ID {entry_id}: {e}")
            
            # Check if there are more pages (Liferay's API usually includes a 'nextPage' link or similar)
            # For simplicity, we'll refetch the first page until it's empty, assuming deletion shifts items up.
            # A more robust solution would parse pagination links from response.
            print("Refetching entries to check for remaining records...")
            
        except requests.exceptions.HTTPError as e:
            print(f"Error fetching entries: {e.response.status_code} - {e.response.text}")
            break
        except requests.exceptions.ConnectionError as e:
            print(f"Connection Error: Could not connect to Liferay at {LIFERAY_HOST}. Is the server running and accessible?")
            break
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            break

    print("Deletion process completed.")

if __name__ == "__main__":
    delete_all_email_records()
```

### Explanation
*   **`OBJECT_DEFINITION_ID` and `REST_CONTEXT_PATH`**: The object's ID and its entries API path.
*   **Fetching Entries**: A `GET` request to the `REST_CONTEXT_PATH` retrieves existing entries. The script includes a basic loop to handle potential pagination (by continuously re-fetching the first page until it returns no items, assuming deleted items are removed from the list).
*   **Deleting Entries**: For each fetched entry, a `DELETE` request is sent to `REST_CONTEXT_PATH/{entry_id}`.

### How to Run
1.  Save the script as `delete_email_records.py`.
2.  Ensure `OBJECT_DEFINITION_ID` and `REST_CONTEXT_PATH` are correctly set.
3.  Execute the script: `python delete_email_records.py`

## Step 4: Populate the Liferay Object with Entries

This step involves generating and submitting data records to your published Liferay Object.

### `populate_email_object.py` Script

```python
import requests
import json
import os
import random
from datetime import datetime, timedelta
import uuid

# --- Configuration ---
LIFERAY_HOST = "https://webserver-lctbootsopticians-prd.lfr.cloud"
LIFERAY_USERNAME = "nick@boots.com"
LIFERAY_PASSWORD = "Gloria1234!"

# Get the Object ID from the successfully created object
# You can also get this from the .gemini/Object_Definition_Email_156560.json file
OBJECT_DEFINITION_ID = 156560 # Replace with the actual ID if different
REST_CONTEXT_PATH = "/o/c/emails" # Corrected REST Context Path for the Email object

# --- Predefined Data ---
EMAIL_ACTION_TYPES = [
    "Onboarding Optician",
    "Accepting Onboarding Offer",
    "Submitting Funding Documents",
    "Submitting GOC Documents",
    "Submitting Insurance Documents",
    "Managing Contracts",
    "Compliance Tasks"
]

OPTICIAN_NAMES = [
    "Dr. Alice Smith", "Dr. Bob Johnson", "Dr. Carol White", "Dr. David Green",
    "Dr. Emily Brown", "Dr. Frank Black", "Dr. Grace Hall", "Dr. Harry King"
]

FRANCHISE_LOCATIONS = [
    "Manchester", "Birmingham", "London Oxford Street", "Glasgow", "Cardiff",
    "Leeds", "Bristol", "Edinburgh", "Liverpool", "Sheffield"
]

BOOTS_ADMIN_EMAILS = [
    "onboarding@boots.com", "compliance@boots.com", "contracts@boots.com",
    "hr@boots.com", "support@boots.com"
]

# --- Helper Functions for Data Generation ---
def generate_email_address(name_part, domain):
    # Sanitize name part for email: remove "Dr. ", replace spaces with dots, convert to lowercase
    name_part = name_part.replace("Dr. ", "").replace(" ", ".").lower()
    # Remove any stray characters like hyphens or special symbols if they are not allowed in email local part
    name_part = ''.join(filter(str.isalnum, name_part.replace('.', ''))) # Keep only alphanumeric
    return f"{name_part}@{domain}"

def generate_subject_and_body(action_type, optician_name, location):
    subjects = {
        "Onboarding Optician": f"Welcome to Boots Opticians, {optician_name} - Your Onboarding Journey Begins!",
        "Accepting Onboarding Offer": f"Confirmation: Onboarding Offer Accepted - {optician_name}, {location}",
        "Submitting Funding Documents": f"Action Required: Funding Document Submission for {optician_name}",
        "Submitting GOC Documents": f"Urgent: GOC Document Submission for {optician_name} ({location})",
        "Submitting Insurance Documents": f"Reminder: Insurance Document Submission for {optician_name}",
        "Managing Contracts": f"Contract Review for {optician_name} at {location} Franchise",
        "Compliance Tasks": f"Compliance Checklist Update for {optician_name}, {location} Store"
    }

    bodies = {
        "Onboarding Optician": f"Dear {optician_name},\n\nWelcome to the Boots Opticians family! We are thrilled to have you join our {location} franchise. This email marks the official start of your onboarding process. You will receive further instructions shortly regarding your induction, training modules, and access to necessary systems.\n\nBest regards,\nBoots Onboarding Team",
        "Accepting Onboarding Offer": f"Dear Boots Onboarding Team,\n\nI am writing to formally accept the onboarding offer for the Optician position at the {location} franchise. I am very excited to begin this new chapter and contribute to the success of Boots Opticians. Please let me know the next steps for documentation and system access.\n\nSincerely,\n{optician_name}",
        "Submitting Funding Documents": f"Dear {optician_name},\n\nWe require you to submit your final funding documents for your {location} franchise. Please upload them to the secure portal by [Date] to ensure timely processing. You can find the link to the portal in your onboarding dashboard.\n\nIf you have any questions, please contact our finance department.\n\nRegards,\nBoots Finance Team",
        "Submitting GOC Documents": f"Dear {optician_name},\n\nThis is an urgent request for the submission of your General Optical Council (GOC) registration documents. We need these by [Date] to finalize your employment at the {location} franchise. Failure to provide these documents promptly may delay your start date.\n\nThank you,\nBoots Compliance Department",
        "Submitting Insurance Documents": f"Dear {optician_name},\n\nPlease submit your professional indemnity insurance documents for your {location} franchise. This is a mandatory requirement. You can upload them through the provided secure link. Please ensure the policy covers all necessary aspects as per Boots Opticians guidelines.\n\nBest regards,\nBoots Compliance Team",
        "Managing Contracts": f"Dear {optician_name},\n\nThis email is to inform you that your franchise contract for the {location} store is due for review. Our contracts team will be in touch shortly to discuss the terms and any potential updates. Please ensure all your current details are up-to-date in your profile.\n\nSincerely,\nBoots Contracts Management",
        "Compliance Tasks": f"Dear {optician_name},\n\nThis is a reminder regarding outstanding compliance tasks for the {location} franchise. Please complete the mandatory training modules on [Topic 1] and [Topic 2] by [Date]. Your adherence to these requirements is crucial for maintaining our high standards.\n\nThank you,\nBoots Compliance Team"
    }
    return subjects.get(action_type, "General Inquiry"), bodies.get(action_type, "No specific body content generated for this action type.")

def generate_random_date(start_date, end_date):
    time_delta = end_date - start_date
    random_days = random.randint(0, time_delta.days)
    random_seconds = random.randint(0, 24 * 60 * 60 - 1)
    return start_date + timedelta(days=random_days, seconds=random_seconds)

# --- Main Population Function ---
def populate_email_object(num_records=200):
    # Use the REST_CONTEXT_PATH directly
    object_entries_url = f"{LIFERAY_HOST}{REST_CONTEXT_PATH}"
    headers = {
        "Content-Type": "application/json",
    }
    auth = (LIFERAY_USERNAME, LIFERAY_PASSWORD)

    print(f"Attempting to populate Liferay Email Object with {num_records} records at {object_entries_url}")

    current_date = datetime.now()
    start_date = current_date - timedelta(days=365) # Emails from the last year

    for i in range(num_records):
        action_type = random.choice(EMAIL_ACTION_TYPES)
        optician_name = random.choice(OPTICIAN_NAMES)
        location = random.choice(FRANCHISE_LOCATIONS)
        
        # Sender: Franchise Optician
        # Example: alice.smith@manchesteropticians.com
        optician_email_name_part = optician_name.replace("Dr. ", "").replace(" ", "") # Simplified part for email prefix
        sender_email = generate_email_address(optician_email_name_part, f"{location.lower().replace(' ', '')}opticians.com")
        
        # Recipient: Boots Admin
        # Example: onboarding@boots.com
        admin_email = random.choice(BOOTS_ADMIN_EMAILS)
        recipient_email = generate_email_address(admin_email.split('@')[0], "boots.com") # Ensure domain is boots.com
        
        subject_text, body_content = generate_subject_and_body(action_type, optician_name, location)
        
        timestamp_date = generate_random_date(start_date, current_date)

        # Randomly include CC/BCC
        cc_emails = []
        if random.random() > 0.7: # 30% chance of having CC
            cc_emails.append(generate_email_address(random.choice(BOOTS_ADMIN_EMAILS).split('@')[0], "boots.com"))
        
        bcc_emails = []
        if random.random() > 0.85: # 15% chance of having BCC
            bcc_emails.append(generate_email_address(random.choice(BOOTS_ADMIN_EMAILS).split('@')[0], "boots.com"))

        email_entry_payload = {
            "sender": sender_email,
            "recipient": recipient_email,
            "cc": ", ".join(cc_emails) if cc_emails else "",
            "bcc": ", ".join(bcc_emails) if bcc_emails else "",
            "subject": subject_text,
            "body": body_content,
            "timestamp": timestamp_date.isoformat(timespec='seconds') + 'Z', # ISO 8601 format with Z for UTC
            "emailActionType": action_type,
            "externalReferenceCode": str(uuid.uuid4()) # Unique ERC for each entry
        }

        try:
            response = requests.post(object_entries_url, headers=headers, auth=auth, data=json.dumps(email_entry_payload))
            response.raise_for_status()
            print(f"Successfully added email entry {i+1}/{num_records} (Subject: '{email_entry_payload['subject']}')")
        except requests.exceptions.HTTPError as e:
            print(f"Error adding email entry {i+1}/{num_records}: {e.response.status_code} - {e.response.text}")
        except requests.exceptions.ConnectionError as e:
            print(f"Connection Error: Could not connect to Liferay at {LIFERAY_HOST}. Is the server running and accessible?")
            break # Stop if connection fails
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            break # Stop on unexpected errors

if __name__ == "__main__":
    populate_email_object(num_records=200)

## Working with Relationship Fields

When an Object has a relationship to another Liferay entity (like an Account), a special field is created. The naming convention for this field is typically `r_{relationshipName}_{relatedObject}Id`.

### Populating the Relationship Field

Based on recent testing, to link an object entry to another entity upon creation, you need to provide the ID of the related entity as a direct integer value. You do not need to wrap it in a JSON object.

-   **Field Name:** `r_accountToEmail_accountEntryId`
-   **Value:** The integer ID of the account (e.g., `38660`)

**Example Payload:**
```json
{
    "sender": "test@example.com",
    "subject": "Test with Relationship",
    "r_accountToEmail_accountEntryId": 38660,
    ...
}
```

### Fetching Related Entity Data

After creating an entry, your application will often need to retrieve the details of the related entity (e.g., get the Account Name for the `accountId` you stored). To do this, you must make a separate API call to the appropriate headless API for that entity.

-   **API to use:** Headless Admin User API
-   **Endpoint to get an Account by ID:** `/o/headless-admin-user/v1.0/accounts/{accountId}`

**Workflow:**
1.  Fetch the Object Entry (e.g., an "Email" entry).
2.  Extract the ID from the relationship field (e.g., the value of `r_accountToEmail_accountEntryId`).
3.  Make a `GET` request to `/o/headless-admin-user/v1.0/accounts/{the-extracted-id}` to get the details of the linked account.
```