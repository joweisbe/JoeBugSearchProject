using System.Threading.Tasks;
using System.Linq;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Azure;
using Azure.Identity;
using Azure.Search.Documents;
using Azure.Search.Documents.Models;
using System;
using System.Net;
using System.Web;

namespace JoeBugSearchProject.Backend.Search
{
    public class SearchFunction
    {
        private readonly ILogger _logger;
        private readonly SearchClient _client;

        public SearchFunction(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<SearchFunction>();

            // Load configuration from environment variables (set in local.settings.json or Azure Portal -> Configuration)
            string serviceEndpoint = Environment.GetEnvironmentVariable("AzureSearchServiceEndpoint");
            string indexName = Environment.GetEnvironmentVariable("AzureIndexName");

            var credential = new DefaultAzureCredential();
            _client = new SearchClient(new Uri(serviceEndpoint), indexName, credential);
        }

        [Function("SearchFunction")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = "search")] HttpRequestData req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request to the search endpoint.");

            // Retrieve the query string (e.g. ?query=bugs)
            var queryParams = HttpUtility.ParseQueryString(req.Url.Query);
            var searchQuery = queryParams["query"] ?? string.Empty;

            try
            {
                // Limit results to 3 by using SearchOptions with Size = 3.
                var options = new SearchOptions { Size = 3 };

                var resultsResponse = await _client.SearchAsync<SearchDocument>(searchQuery, options);
                var simplifiedResults = resultsResponse.Value.GetResults()
                    .Select(r => new
                    {
                        BugID = r.Document.ContainsKey("BugID") ? r.Document["BugID"] : null,
                        SubmissionID = r.Document.ContainsKey("SubmissionID") ? r.Document["SubmissionID"] : null,
                        RequirementNoFull = r.Document.ContainsKey("RequirementNoFull") ? r.Document["RequirementNoFull"] : null,
                        BugType = r.Document.ContainsKey("BugType") ? r.Document["BugType"] : null
                    })
                    .Take(3);

                var resultObject = new
                {
                    TotalCount = resultsResponse.Value.TotalCount,
                    Results = simplifiedResults
                };

                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(resultObject);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Search operation failed.");

                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync("Search operation failed.");
                return errorResponse;
            }
        }
    }
}
