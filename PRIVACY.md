# Privacy Policy

Transparency is a core value of this project. This document outlines exactly what data is collected when you use this instance of the proxy and how that data is used.

## 1. No Personal Data Collection
We believe in data minimization. The following are **NOT** collected:
*   **No IP Addresses:** We do not log the source IP of any request.
*   **No User Agents:** We do not log information about your browser or OS.
*   **No Auth Tokens:** Your Gemfury or registry credentials are processed in-memory to fulfill requests but are never saved to logs or persistent storage.

## 2. Data Being Collected
We use the Cloudflare Workers Analytics Engine to store the following data points for operational monitoring and project health:

| Data Point | Description | Example |
| :--- | :--- | :--- |
| **Method** | The HTTP verb used. | `GET` |
| **Path** | The endpoint requested. | `/` |
| **Query String** | The package and user parameters. | `?pkg=example&user=dev` |
| **Colo** | The Cloudflare data center location. | `GRU` (São Paulo) |
| **Status** | The HTTP response code. | `200`, `502` |
| **Latency** | How long the request took to process. | `45ms` |
| **Error Message** | Internal error strings if a crash occurs. | `OK` or `Upstream timeout` |

## 3. Purpose of Collection
The data is used strictly for:
*   **Debugging:** Identifying if the proxy or the upstream registry is experiencing downtime.
*   **Optimization:** Monitoring latency to ensure the Edge performance is meeting expectations.
*   **Usage Trends:** Identifying popular packages to help guide future development.

## 4. Third-Party Processing
This data is stored on **Cloudflare's** infrastructure. By using this service, you acknowledge that your request metadata (as listed above) is processed by Cloudflare in accordance with their privacy policy.

## 5. Self-Hosting
If you prefer to have zero telemetry, this project is designed to be easily self-hosted. You can disable the telemetry wrapper in `worker.js` and deploy your own instance to Cloudflare or any compatible environment.
