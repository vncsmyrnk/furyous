terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5"
    }
  }
}

provider "cloudflare" {}

data "cloudflare_zone" "domain" {
  zone_id = var.zone_id
}

resource "cloudflare_workers_script" "proxy_script" {
  account_id  = var.account_id
  script_name = "furyous-worker"
  content     = file("${path.module}/../src/worker.js")
  main_module = "worker.js"

  bindings = [
    {
      name = "REGISTRY_BASE_URL"
      type = "plain_text"
      text = var.fury_registry_base_url
    }
  ]
}

resource "cloudflare_workers_route" "furyous_route" {
  zone_id = var.zone_id
  pattern = "${cloudflare_dns_record.api_proxy_dns.name}/*"
  script  = "furyous-worker"
}

resource "cloudflare_dns_record" "api_proxy_dns" {
  zone_id = var.zone_id
  name    = var.subdomain
  type    = "A"
  content = "192.0.2.1"
  proxied = true
  ttl     = 1
}

resource "cloudflare_ruleset" "edge_cache_rule" {
  zone_id     = var.zone_id
  name        = "Force Edge Cache for Subdomain"
  description = "Caches everything on the proxy subdomain"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  rules = [
    { # WARNING: this rule is shared with all subdomains on this zone
      name       = "Caches everything"
      action     = "set_cache_settings"
      expression = "(http.host eq \"${data.cloudflare_zone.domain.name}\")"

      action_parameters = {
        cache = true
        edge_ttl = {
          mode    = "override_origin"
          default = 86400
        }
      }
    },
    {
      name       = "Caches everything on the subdomain"
      action     = "set_cache_settings"
      expression = "(http.host eq \"${cloudflare_dns_record.api_proxy_dns.name}\")"

      action_parameters = {
        cache = true
        edge_ttl = {
          mode    = "override_origin"
          default = var.edge_cache_ttl
        }
      }
    }
  ]
}
