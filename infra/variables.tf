variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "zone_id" {
  description = "Cloudflare Zone ID"
  type        = string
}

variable "subdomain" {
  description = "The subdomain to use"
  type        = string
  default     = "furyous"
}

variable "edge_cache_ttl" {
  description = "Edge cache TTL"
  type        = number
  default     = 86400 # Default to 1 day
}

variable "fury_registry_base_url" {
  description = "Edge cache TTL"
  type        = string
  default     = "https://apt.fury.io"
}
