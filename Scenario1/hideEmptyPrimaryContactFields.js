this.formHideEmptyContactFields = function (executionContext) { 
  const formContext = executionContext.getFormContext();

  try { 
    const quickView = formContext.ui.quickForms.get("primary_contact_details");

    if (quickView && quickView.isLoaded()) {
      hideEmptyContactFields(quickView);
    }

  } catch (error) {
    formContext.ui.setFormNotification(`Error: ${error.message}`, "ERROR", "IDUnique33332");
  }
}

function hideEmptyContactFields(quickView) {
  const qvEmail = quickView.getControl("emailaddress1").getAttribute()?.getValue();
  const qvTelephone = quickView.getControl("telephone1").getAttribute()?.getValue();
  const qvMobile = quickView.getControl("mobilephone").getAttribute()?.getValue();

  // Hide empty fields in quick view form
  if (qvEmail === null) quickView.getControl("emailaddress1").setVisible(false);
  if (qvTelephone === null) quickView.getControl("telephone1").setVisible(false);
  if (qvMobile === null) quickView.getControl("mobilephone").setVisible(false);
}