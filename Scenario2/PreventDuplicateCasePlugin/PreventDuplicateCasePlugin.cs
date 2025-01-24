using System;

using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

using PreventDuplicateCasePlugin.Helpers;

namespace PreventDuplicateCasePlugin
{
    public class PreventDuplicateCasePlugin : IPlugin
    {
        // The main entry point for the plugin. This method is called when the plugin is executed
        public void Execute(IServiceProvider serviceProvider)
        {
            if (serviceProvider == null)
            {
                throw new ArgumentNullException(nameof(serviceProvider));
            }

            // Obtain the execution context from the service provider
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));

            // Check if the plugin is running on case creation
            if (context.PrimaryEntityName.ToLower() != "incident" || context.MessageName.ToLower() != "create")
            {
                return;
            }

            // Get the organization service and tracing service.
            //IOrganizationService service = GetOrganizationService(serviceProvider, context.UserId);
            //ITracingService tracingService = GetTracingService(serviceProvider);
            IOrganizationService service = ServiceHelper.GetOrganizationService(serviceProvider, context.UserId);
            ITracingService tracingService = ServiceHelper.GetTracingService(serviceProvider);

            try
            {
                // Retrieve the Target Entity (Case) from the input parameters
                Entity caseEntity = (Entity)context.InputParameters["Target"];
                if (caseEntity == null) 
                { 
                    return; 
                }

                // Get the customer (account or contact) associated with the case
                EntityReference customerRef = caseEntity.Contains("customerid") ? (EntityReference)caseEntity["customerid"] : null;

                // Only check for duplicate cases if customer is an account
                if (customerRef == null || customerRef.LogicalName != "account") 
                { 
                    return; 
                }

                // Retrieve the count of active cases for the account
                int activeCaseCount = CaseHelper.GetActiveCaseCount(service, customerRef.Id);

                // Stop creation if there is already an active case open for the account
                if (activeCaseCount > 0)
                {
                    throw new InvalidPluginExecutionException("An active case already exists for this account. System cannot create a new one before it is resolved.");
                }
            }
            catch (InvalidPluginExecutionException ex)
            {
                // Trace the exception and rethrow it
                tracingService.Trace("An active case already exists for this account. System cannot create a new one before it is resolved. {0}", ex.ToString());
                throw;
            }
            catch (Exception ex)
            {
                // Trace the exception and throw a new InvalidPluginExecutionException
                tracingService.Trace("An error occurred in PreventDuplicateCase. Please contact support: {0}", ex.ToString());
                throw new InvalidPluginExecutionException($"An error occurred in PreventDuplicateCase. {ex.Message}");
            }
        }
    }
}