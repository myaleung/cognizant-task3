using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PreventDuplicateCasePlugin.Helpers
{
    public static class CaseHelper
    {
        // Check if specific accountId has any active cases open
        public static int GetActiveCaseCount(IOrganizationService service, Guid accountId)
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

            // Execute the query and return the count of active cases.
            EntityCollection existingCases = service.RetrieveMultiple(query);
            return existingCases.Entities.Count;
        }
    }
}
