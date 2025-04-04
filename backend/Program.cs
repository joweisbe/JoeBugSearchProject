using Microsoft.Extensions.Hosting;
using Microsoft.Azure.Functions.Worker.Configuration;

var host = new HostBuilder()
    //.ConfigureFunctionsWorkerDefaults()  // Registers Azure Functions worker
    .ConfigureFunctionsWebApplication()
    .Build();

host.Run();
