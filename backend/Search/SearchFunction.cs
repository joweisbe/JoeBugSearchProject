using System.Threading.Tasks;
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

            // We'll wrap the actual search call in a try-catch to handle any unexpected errors.
            try
            {
                var resultsResponse = await _client.SearchAsync<SearchDocument>(searchQuery);
                var searchResults = resultsResponse.Value.GetResults();

                // Example output structure:
                var resultObject = new
                {
                    TotalCount = resultsResponse.Value.TotalCount,
                    Results = searchResults
                };

                // Build the response
                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "application/json");
                await response.WriteAsJsonAsync(resultObject);
                return response;
            }
            catch (Exception ex)
            {
                // Log the exception
                _logger.LogError(ex, "Search operation failed.");

                // Return a generic 500 Internal Server Error response
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                errorResponse.WriteString("An error occurred while processing your search request.");
                return errorResponse;
            }
        }
    }
}
