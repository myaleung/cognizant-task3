this.formOnLoad = async function (executionContext) {
  const formContext = executionContext.getFormContext();

  try {
    const customer = formContext.getAttribute("customerid").getValue();
    // Set form notification if null
    if (customer == null) {
      formContext.ui.setFormNotification("Please select a customer.", "INFO", "IDUnique11111");
      return;
    } else {
      // Clear the form notification if customer is populated
      formContext.ui.clearFormNotification("IDUnique11111");
    }

    // Hide contact field if customer is not an account
    if (customer[0].entityType !== "account") {
      formContext.getControl("primarycontactid").setVisible(false);
      return;
    }

    // Set primary contact information from customer
    const customerId = getCustomerId(formContext);
    const primaryContactId = await getPrimaryContactId(customerId);
    const contactDetails = await getContactDetails(primaryContactId);

    setPrimaryContact(formContext, contactDetails);
  } catch (error) {
    throw new Xrm.Navigation.openAlertDialog({
      text: `Error: ${error.message}`});
  }
}

// Helper functions
function getCustomerId(formContext) {
  const customer = formContext.getAttribute("customerid").getValue();
  return customer ? customer[0].id.replace(/[{}]/g, "") : null;
}

//TODO: Update this function to merge the bottom using expand query
// expand query to retrieve primary contact ID
async function getPrimaryContactId(accountId) {
  try {
    const primaryContact = await Xrm.WebApi.retrieveRecord("account", accountId, "?$select=_primarycontactid_value");
    return primaryContact._primarycontactid_value;
  } catch (error) {
    throw new Error(`Failed to retrieve primary contact ID: ${error.message}`);
  }
}

//TODO: Remove this function
async function getContactDetails(customerId) {
  try {
    const contact = await Xrm.WebApi.retrieveRecord("contact", customerId, "?$select=fullname");
    return {
      id: customerId,
      name: contact.fullname,
    };
  } catch (error) {
    throw new Error(`Failed to retrieve contact details: ${error.message}`);
  }
}

function setPrimaryContact(formContext, contactDetails) {
  formContext.getAttribute("primarycontactid").setValue([{
    id: contactDetails.id,
    name: contactDetails.name,
    entityType: "contact"
  }]);
}