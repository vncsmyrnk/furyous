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
    },
    {
      name = "EDGE_CACHE_TTL"
      type = "plain_text"
      text = var.edge_cache_ttl
    }
  ]

  lifecycle {
    ignore_changes = [
      content,
      bindings
    ]
  }
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
