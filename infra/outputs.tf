output "proxy_base_url" {
  description = "The base URL where the APT proxy is listening"
  value       = "https://${cloudflare_dns_record.api_proxy_dns.name}"
}

output "workers_script_name" {
  description = "The name of the deployed Cloudflare Worker"
  value       = cloudflare_workers_script.proxy_script.script_name
}

output "cache_rule_id" {
  description = "The ID of the Edge Cache ruleset"
  value       = cloudflare_ruleset.edge_cache_rule.id
}
