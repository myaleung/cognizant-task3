using System;

using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace PreventDuplicateCasePlugin
{
    public class PreventDuplicateCasePlugin : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            if (serviceProvider == null)
            {
                throw new ArgumentNullException(nameof(serviceProvider));
            }

            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));

            // Check if the plugin is running on case creation
            if (context.PrimaryEntityName.ToLower() != "incident" || context.MessageName.ToLower() != "create")
            {
                return;
            }

            // Get the service factory and tracing service
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            try
            {
                // Retrieve the Target Entity (Case)
                Entity caseEntity = (Entity)context.InputParameters["Target"];
                if (caseEntity == null) 
                { 
                    return; 
                }

                // Get Account (Customer)
                EntityReference customerRef = caseEntity.Contains("customerid") ? (EntityReference)caseEntity["customerid"] : null;

                // Only check for duplicate cases if customer is an Account
                if (customerRef == null || customerRef.LogicalName != "account") 
                { 
                    return; 
                }

                // Retrieve the count of active cases for the account
                int activeCaseCount = GetActiveCaseCount(service, customerRef.Id);

                // Stop creation if there is already an active case open for the account
                if (activeCaseCount > 0)
                {
                    throw new InvalidPluginExecutionException("An active case already exists for this account. System cannot create a new one before it is resolved.");
                }
            }
            catch (InvalidPluginExecutionException ex)
            {
                tracingService.Trace("An active case already exists for this account. System cannot create a new one before it is resolved. {0}", ex.ToString());
                throw;
            }
            catch (Exception ex)
            {
                tracingService.Trace("An error occurred in PreventDuplicateCase. Please contact support: {0}", ex.ToString());
                throw new InvalidPluginExecutionException($"An error occurred in PreventDuplicateCase. {ex.Message}");
            }
        }

        // Check if specific accountId has any active cases open
        private int GetActiveCaseCount(IOrganizationService service, Guid accountId)
        {
            QueryExpression query = new QueryExpression("incident")
            {
                ColumnSet = new ColumnSet("statecode"),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression("customerid", ConditionOperator.Equal, accountId),
                        new ConditionExpression("statecode", ConditionOperator.Equal, 0) // 0 = Active case
                    }
                },
                TopCount = 1 // Only need to check if there is at least one active case
            };

            EntityCollection existingCases = service.RetrieveMultiple(query);
            return existingCases.Entities.Count;
        }
    }
}