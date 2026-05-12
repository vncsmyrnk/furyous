![Terraform](https://img.shields.io/badge/Terraform-grey?logo=terraform&style=plastic)
[![Cloudflare Workers](https://img.shields.io/badge/-Cloudflare%20Workers-grey?style=plastic&logo=cloudflare)](https://developers.cloudflare.com/workers/)
![NodeJS](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2Fvncsmyrnk%2Ffuryous%2Fraw%2Frefs%2Fheads%2Fmain%2Fpackage.json&query=%24.engines.node&style=plastic&logo=node.js&label=nodejs&color=green)
![PNPM](https://img.shields.io/badge/dynamic/regex?url=https%3A%2F%2Fgithub.com%2Fvncsmyrnk%2Ffuryous%2Fraw%2Frefs%2Fheads%2Fmain%2Fpackage.json&search=%22packageManager%22%3A%20%22pnpm%5C%40(.*)%22&replace=v%241&style=plastic&logo=pnpm&label=pnpm&color=yellow)
![esbuild](https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fgithub.com%2Fvncsmyrnk%2Ffuryous%2Fraw%2Frefs%2Fheads%2Fmain%2Fpnpm-lock.yaml&query=%24.importers.'.'.devDependencies.esbuild.version&prefix=v&style=plastic&logo=esbuild&label=esbuild&color=yellow)
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

- [vncsmyrnk/gwin](https://github.com/vncsmyrnk/gwin/blob/005f748cbb2c534ed83712fcca9291d072c1f9b1/README.md?plain=1#L4): [furyous.vncsmyrnk.dev?user=vncsmyrnk&pkg=gwin](https://furyous.vncsmyrnk.dev/?user=vncsmyrnk&pkg=gwin)
- [vncsmyrnk/shell-utils](https://github.com/vncsmyrnk/shell-utils/blob/9759c23e2dc7e8156009ae41e71eb66ae976050d/README.md?plain=1#L4): [furyous.vncsmyrnk.dev?user=vncsmyrnk&pkg=shell-utils](https://furyous.vncsmyrnk.dev/?user=vncsmyrnk&pkg=shell-utils)

> [!NOTE]
> This project uses **Cloudflare Workers Analytics Engine** to collect anonymous usage metrics. This data helps in monitoring the health of the proxy (e.g., catching 502/500 errors) and understanding which packages are most frequently requested.
>
> IP addresses or any personally identifiable information (PII) are **not** logged in any way.
>
> For a detailed breakdown, please see [PRIVACY.md](./PRIVACY.md).
