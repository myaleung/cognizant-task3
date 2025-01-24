// Static variable to keep track of the notification count
let notificationNumCount = 0;
let currentNotificationId = null;

// Constants for attribute and control names
const CUSTOMER_ID = "customerid";
const PRIMARY_CONTACT_ID = "primarycontactid";
const ORIGIN_FIELD_ID = "caseorigincode";

this.formPopulatePrimaryContactFields = async function (executionContext) {
  const formContext = executionContext.getFormContext();

  try {
    const customer = formContext.getAttribute(CUSTOMER_ID).getValue();
    const primaryContactField = formContext.getControl(PRIMARY_CONTACT_ID);
    const originField = formContext.getAttribute(ORIGIN_FIELD_ID);

    // Guard clause to check if the primary contact field exists
    if (!primaryContactField) {
      throw new Error(`The field for Contact could not be found on the form.`);
    }

    // Guard clause to check if the origin field exists
    if (!originField) {
      throw new Error(`The field for Origin could not be found on the form.`);
    }

    if (customer == null || customer[0] == null) {
      // Set form notification if null
      currentNotificationId = updatedNotificationIdNum();
      formContext.ui.setFormNotification("Please select a customer.", "WARNING", currentNotificationId);
      return;
    } else {
      // Clear the form notification if customer is populated
      formContext.ui.clearFormNotification(currentNotificationId);
      // Set primary contact field as required as a customer has been selected
      setRequiredLevel(originField, "required");
    }

    // Remove contact form field (primarycontactid) from view if customer is a contact record type
    if (customer[0] !== null && customer[0].entityType !== "account") {
      setRequiredLevel(originField, "none");
      setFieldVisibility(primaryContactField, false);
      return;
    } 

    // Set primary contact information from customer
    const customerId = customer[0].id.replace(/[{}]/g, "");
    const primaryContactDetails = await getPrimaryContactDetails(customerId);

    if (primaryContactDetails === null) {
      throw new Error("Primary contact details could not be retrieved.");
    }

    setPrimaryContact(formContext, primaryContactDetails);
  } catch (error) {
    Xrm.Navigation.openErrorDialog({
      message: error.message,
      details: error.stack});
  }
}

// Retrieve primary contact details from account
async function getPrimaryContactDetails (accountId) {
  try {
    // Retrieve primary contact details from account table based on accountId, and return contact name from primarycontactid field
    const account = await Xrm.WebApi.retrieveRecord(
      "account",
      accountId,
      `?$select=${PRIMARY_CONTACT_ID}&$expand=${PRIMARY_CONTACT_ID}($select=fullname)`
    );

    // Check if the account, primary contact or full name is null
    if (!account) {
      throw new Error("Account not found.");
    }

    if (!account[PRIMARY_CONTACT_ID]) {
      throw new Error("No primary contact found for the account.");
    }

    if (!account[PRIMARY_CONTACT_ID].fullname) {
      throw new Error("Full name for the primary contact not found.");
    }

    const newPrimaryContact = {
      id: account[PRIMARY_CONTACT_ID].contactid,
      name: account[PRIMARY_CONTACT_ID].fullname
    };

    return newPrimaryContact;
  } catch (error) {
    throw new Error(`Failed to retrieve primary contact: ${error.message}`);
  }
}

// Set Primary Contact quick view fields with contact details
function setPrimaryContact(formContext, contactDetails) {
  const contactField = formContext.getAttribute(PRIMARY_CONTACT_ID);
  const updatedPrimaryContact = [{
    id: contactDetails.id,
    name: contactDetails.name,
    entityType: "contact"
  }];

  // If contact details are not null, set the contact field with contact details
  if (contactDetails !== null) {
    contactField.setValue(updatedPrimaryContact);
    contactField.fireOnChange();
  }
}

// Set the requiredLevel of a field
function setRequiredLevel (controlField, requirement) { 
  if (controlField !== null) {
    controlField.setRequiredLevel(requirement);
  }
}

// Set the visibility (show/hide) of a field depending if it is empty
function setFieldVisibility(controlField, visibility) { 
  if (controlField == null) {
    controlField.setVisible(visibility);
  }
}

// Increment notification ID for each error
function updatedNotificationIdNum () {
  notificationNumCount += 1;
  return `IDCPL${notificationNumCount.toString().padStart(5, '0')}`;
}