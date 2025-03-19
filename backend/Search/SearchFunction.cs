using System.Threading.Tasks;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Azure;
using Azure.Identity;
using Azure.Search.Documents;
using Azure.Search.Documents.Models;
using System;

namespace JoeBugSearchProject.Backend.Search
{
    public class SearchFunction
    {
        private readonly ILogger _logger;
        private readonly SearchClient _client;

        public SearchFunction(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<SearchFunction>();

            // Load configuration from environment variables (set in local.settings.json or Azure App Settings)
            string serviceEndpoint = Environment.GetEnvironmentVariable("AzureSearchServiceEndpoint");
            string indexName = Environment.GetEnvironmentVariable("AzureIndexName");

            var credential = new DefaultAzureCredential();
            _client = new SearchClient(new Uri(serviceEndpoint), indexName, credential);
        }

        [Function("SearchFunction")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = "search")] HttpRequestData req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a search request.");

            // Retrieve the query string. Assumes the query parameter is passed in the URL, e.g., ?query=...
            // You can further parse it if needed.
            var queryParams = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var searchQuery = queryParams["query"] ?? string.Empty;

            // Execute search using the SearchClient
            var resultsResponse = await _client.SearchAsync<SearchDocument>(searchQuery);
            var searchResults = resultsResponse.Value.GetResults();

            var resultObject = new
            {
                TotalCount = resultsResponse.Value.TotalCount,
                Results = searchResults
            };

            // Create the JSON response.
            var response = req.CreateResponse(System.Net.HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            await response.WriteAsJsonAsync(resultObject);
            return response;
        }
    }
}
