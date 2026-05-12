export function withTelemetry(handler) {
  return async function(request, env, ctx) {
    const startTime = Date.now();
    let response;
    let errorStr = "OK";

    try {
      response = await handler(request, env, ctx);
      return response;
    } catch (err) {
      errorStr = err.message;
      response = new Response("Internal Server Error", { status: 500 });
      return response;
    } finally {
      if (env.EDGE_METRICS) {
        const url = new URL(request.url);
        env.EDGE_METRICS.writeDataPoint({
          indexes: ["anonymous"],
          blobs: [
            request.method || "UNKNOWN",
            url.pathname || "/",
            request.cf?.colo || "DEV",
            errorStr || "OK",
            url.searchParams.get("user") || "none",
            url.searchParams.get("pkg") || "none",
          ],
          doubles: [Date.now() - startTime, response.status]
        });
      }
    }
  };
}
