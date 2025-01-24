// Static variable to keep track of the notification count
let notificationNumCount = 0;
let currentNotificationId = null;

this.formPopulatePrimaryContactFields = async function (executionContext) {
  const formContext = executionContext.getFormContext();

  try {
    const customer = formContext.getAttribute("customerid").getValue();
    if (customer == null || customer[0] == null) {
      // Set form notification if null
      currentNotificationId = updatedNotificationIdNum();
      formContext.ui.setFormNotification("Please select a customer.", "INFO", currentNotificationId);
      return;
    } else {
      // Clear the form notification if customer is populated
      formContext.ui.clearFormNotification(currentNotificationId);
    }

    // Remove contact form field (primarycontactid) from view if customer is a contact record type
    if (customer[0] && customer[0].entityType !== "account") {
      formContext.getControl("primarycontactid").setVisible(false);
      return;
    }

    // Set primary contact information from customer
    const customerId = customer[0].id.replace(/[{}]/g, "");
    const primaryContactDetails = await getPrimaryContactDetails(customerId);

    setPrimaryContact(formContext, primaryContactDetails);
  } catch (error) {
    Xrm.Navigation.openErrorDialog({
      message: error.message,
      details: error.stack});
  }
}

// Retrieve primary contact details from account
async function getPrimaryContactDetails(accountId) {
  try {
    // Retrieve primary contact details from account table based on accountId, and return contact name from primarycontactid field
    const account = await Xrm.WebApi.retrieveRecord(
      "account",
      accountId,
      "?$select=primarycontactid&$expand=primarycontactid($select=fullname)"
    );

    // Check if the account, primary contact or full name is null
    if (!account) {
      throw new Error("Account not found.");
    }

    if (!account.primarycontactid) {
      throw new Error("No primary contact found for the account.");
    }

    if (!account.primarycontactid.fullname) {
      throw new Error("Full name for the primary contact not found.");
    }

    const newPrimaryContact = {
      id: account.primarycontactid.contactid,
      name: account.primarycontactid.fullname
    };

    return newPrimaryContact;
  } catch (error) {
    throw new Error(`Failed to retrieve primary contact: ${error.message}`);
  }
}

// Set Primary Contact quick view fields with contact details
function setPrimaryContact(formContext, contactDetails) {
  const contactField = formContext.getAttribute("primarycontactid");
  const updatedPrimaryContact = {
    id: contactDetails.id,
    name: contactDetails.name,
    entityType: "contact"
  }

  // If contact details are not null, set the contact field with contact details
  if (contactDetails === null) {
    contactField.setValue(updatedPrimaryContact);
    contactField.fireOnChange();
  }
}

// Increment notification ID for each error
function updatedNotificationIdNum() {
  notificationNumCount += 1;
  return `IDCPL${notificationNumCount.toString().padStart(5, '0')}`;
}