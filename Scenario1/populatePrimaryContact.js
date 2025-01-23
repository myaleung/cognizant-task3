this.formPopulatePrimaryContactFields = async function (executionContext) {
  const formContext = executionContext.getFormContext();
  formContext.ui.setFormNotification("Current Version: v8.", "INFO", "IDCPL00001");

  try {
    const customer = formContext.getAttribute("customerid").getValue();
    if (customer == null) {
      // Set form notification if null
      formContext.ui.setFormNotification("Please select a customer.", "INFO", "IDCPL00002");
      return;
    } else {
      // Clear the form notification if customer is populated
      formContext.ui.clearFormNotification("IDCPL00002");
    }

    // Hide contact field if customer is not an account
    if (customer[0].entityType !== "account") {
      formContext.getControl("primarycontactid").setVisible(false);
      return;
    }

    // Set primary contact information from customer
    const customerId = getCustomerId(formContext);
    const primaryContactDetails = await getPrimaryContactDetails(customerId);

    setPrimaryContact(formContext, primaryContactDetails);
  } catch (error) {
    Xrm.Navigation.openErrorDialog({
      message: error.message,
      details: error.stack});
  }
}

// Helper functions
function getCustomerId(formContext) {
  const customer = formContext.getAttribute("customerid").getValue();
  return customer ? customer[0].id.replace(/[{}]/g, "") : null;
}

// Retrieve primary contact details from account
async function getPrimaryContactDetails(accountId) {
  try {
    // Retrieve and expand primary contact for contact details
    const account = await Xrm.WebApi.retrieveRecord(
      "account",
      accountId,
      "?$select=primarycontactid&$expand=primarycontactid($select=fullname)"
    );

    return {
      id: account.primarycontactid.contactid,
      name: account.primarycontactid.fullname
      };
  } catch (error) {
    throw new Error(`Failed to retrieve primary contact: ${error.message}`);
  }
}

// Set Primary Contact quick view fields with contact details
function setPrimaryContact(formContext, contactDetails) {
  console.log("Setting primary contact:", contactDetails);
  const contactField = formContext.getAttribute("primarycontactid");

  contactField.setValue([{
    id: contactDetails.id,
    name: contactDetails.name,
    entityType: "contact"
  }]);
  contactField.fireOnChange();
}