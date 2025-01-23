this.formHideEmptyContactFields = function (executionContext) { 
  const formContext = executionContext.getFormContext();

  try { 
    const quickView = formContext.ui.quickForms.get("primary_contact_details");

    if (quickView !== null && quickView.isLoaded()) {
      hideEmptyContactFields(quickView);
    }
    return;

  } catch (error) {
    Xrm.Navigation.openErrorDialog({
      message: error.message,
      details: error.stack
    });
  }
}

// Hide empty form fields in quick view form
function hideEmptyContactFields(quickView) {
  hideIfEmpty(quickView, "emailaddress1");
  hideIfEmpty(quickView, "telephone1");
  hideIfEmpty(quickView, "mobilephone");
}

// Hide control if its value is empty
function hideIfEmpty(quickView, controlName) {
  const control = quickView.getControl(controlName);
  if (!control) {
    throw new Error(`${controlName} could not be found in quick view form.`);
  }

  const value = control.getAttribute()?.getValue();
  if (value === null) {
    control.setVisible(false);
  }
}