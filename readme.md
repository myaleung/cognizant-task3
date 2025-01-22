# Cognizant Task 3 Project (Power Apps)

This project contains two scenarios implemented in JavaScript and C# for a Dynamics 365 environment. The scenarios are designed to enhance the functionality of the system by preventing duplicate cases and managing primary contact information. These scenarios were an assignment issued by Cognizant.

## Scenario 1: Populate and Hide Empty Primary Contact Fields

### Files
- `populatePrimaryContact.js`
- `hideEmptyPrimaryContactFields.js`

### Description
This scenario involves two main functionalities:
1. **Populate Primary Contact Information**: When a customer is selected on the form, the primary contact information is automatically populated based on the selected customer.
2. **Hide Empty Primary Contact Fields**: After the primary contact information is populated, any empty fields in the quick view form are hidden.

### `populatePrimaryContact.js`
This script is executed when the form is loaded. It performs the following actions:
- Checks if a customer is selected. If not, it displays a notification.
- If the selected customer is not an account, it hides the primary contact field and displays a warning notification.
- Retrieves the primary contact information from the selected customer and sets it on the form.

### `hideEmptyPrimaryContactFields.js`
This script is executed to hide any empty fields in the quick view form. It performs the following actions:
- Targets the quick view form named `primary_contact_details`.
- Checks if the quick view form is loaded. If loaded, it hides any empty fields (email, telephone, mobile phone).

### Usage
1. Add the `populatePrimaryContact.js` script to the form's `onLoad` event.
2. Add the `hideEmptyPrimaryContactFields.js` script to the quick view form's `onLoad` event.

## Scenario 2: Prevent Duplicate Case Creation

### File
- `PreventDuplicateCase.cs`

### Description
This scenario involves preventing the creation of duplicate cases in the system. The plugin checks for existing cases with the same title and customer before allowing a new case to be created.

### `PreventDuplicateCase.cs`
This C# plugin is executed when a new case is created. It performs the following actions:
- Checks if the plugin is running on case creation.
- Retrieves the target case entity from the context.
- Queries the system to check for existing cases with the same customer.
- If a duplicate case is found, it throws an exception to prevent the creation of the new case.

### Usage
1. Register the `PreventDuplicateCase` plugin on the `Create` message of the `incident` entity.
2. Ensure the plugin is executed in the pre-operation stage to prevent the case from being created.

## Installation
1. Deploy the JavaScript files (`populatePrimaryContact.js` and `hideEmptyPrimaryContactFields.js`) to the Dynamics 365 web resources.
2. Add the JavaScript files to the appropriate form events (onLoad for the main form and quick view form).
3. Deploy the C# plugin (`PreventDuplicateCase.cs`) to the Dynamics 365 server.
4. Register the plugin step using the Plugin Registration Tool.

## License
This project is licensed under the MIT License.

## Author
Amy Leung