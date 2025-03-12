using Azure;
using Azure.Identity;
using Azure.Search.Documents;
using Azure.Search.Documents.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using System;

var builder = WebApplication.CreateBuilder(args);

// Load Azure configuration from appsettings.json
var serviceEndpoint = builder.Configuration["Azure:SearchServiceEndpoint"];
var indexName = builder.Configuration["Azure:IndexName"];

var credential = new DefaultAzureCredential();
var client = new SearchClient(new Uri(serviceEndpoint), indexName, credential);

var app = builder.Build();

// Search API Endpoint
app.MapGet("/search", async (string query) =>
{
    var results = await client.SearchAsync<SearchDocument>(query);
    return Results.Ok(results.Value.GetResults());
});

app.Run();
