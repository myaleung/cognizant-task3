using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PreventDuplicateCasePlugin.Helpers
{
    public static class ServiceHelper
    {
        // Service helper method to retrieve the organization service for the specified user.
        public static IOrganizationService GetOrganizationService(IServiceProvider serviceProvider, Guid userId)
        {
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            return serviceFactory.CreateOrganizationService(userId);
        }

        // Retrieve the tracing service.
        public static ITracingService GetTracingService(IServiceProvider serviceProvider)
        {
            return (ITracingService)serviceProvider.GetService(typeof(ITracingService));
        }
    }
}
