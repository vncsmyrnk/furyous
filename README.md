![javascript](https://img.shields.io/badge/javascript-grey?logo=javascript&style=plastic)
![Terraform](https://img.shields.io/badge/Terraform-grey?logo=terraform&style=plastic)
[![Cloudflare Workers](https://img.shields.io/badge/-Cloudflare%20Workers-grey?style=plastic&logo=cloudflare)](https://developers.cloudflare.com/workers/)
<br>
[![CI/CD Pipeline](https://github.com/vncsmyrnk/furyous/actions/workflows/ci.yml/badge.svg)](https://github.com/vncsmyrnk/furyous/actions/workflows/ci.yml)
[![contributions](https://img.shields.io/badge/contributions-welcome-brightgreen?labelColor=384047&color=33cb56&style=plastic)](https://github.com/vncsmyrnk/furyous/issues)

# furyous

Proxy capable of extracting the latest Semantic Version (SemVer) of [Debian packages from fury](https://fury.co/l/debian-repository/).

Designed for CI/CD pipelines, bash scripts, and automated update checkers that need to quickly resolve the absolute latest version of a package without downloading massive repository manifests.

## Initial problem

[My packages hosted at fury](https://apt.fury.io/vncsmyrnk/Packages) were often listed in no particular order. This made it difficult to get the latest version of a package to be shown in a GitHub badge or in the package documentation.

## Usage

### URL Query Strings

The service is entirely controlled via URL query parameters. Send a `GET` request to the base URL with the following strings:

| Parameter | Type     | Requirement | Description |
| :-------- | :------- | :---------- | :---------- |
| `user`    | `string` | **Required**| The absolute, direct URL to the plain-text `Packages` file of the target APT repository. |
| `pkg`     | `string` | **Required**| The exact name of the package you want to query. |

### Examples

[furyous.vncsmyrnk.dev?user=vncsmyrnk&pkg=shell-utils](https://furyous.vncsmyrnk.dev/?user=vncsmyrnk&pkg=shell-utils)
