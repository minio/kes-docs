---
title: kes server
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Starts a KES server.

Defaults to using `0.0.0.0:7373` unless specified in the [config]({{< relref "/tutorials/configuration#config-file" >}}) file or the `--addr` parameter.

## Syntax

```sh
kes server              \
    --addr <IP:PORT>    \
    --config <path>     \
    --key <path>        \
    --cert <path>       \
    --auth={on|off}
```

## Parameters

### `--addr`

The IP address and port to use for the server.

If not specified, the default value is `0.0.0.0:7373`.

### `--config`

Path to the YAML-formatted config file to use.

### `--key`

Path to the TLS private key.

If also present in the specified config file, the `key` entered here takes precedence.

### `--cert`

Path to the TLS certificate.

If also present in the specified config file, the `cert` entered here takes precedence.

### `--auth`

Controls how the server handles mTLS authentication.

By default, the server requires a client certificate and verifies that certificate has been issued by a trusted certificate authority.

- Require a certificate and verify it's validity: `--auth=on` (default)
- Require a certificate, but do not verity its validity `--auth=off`

If turned off, the client accepts arbitrary certificates, but continues to map them to policies.
This disables _authentication_, but does **not** disable _authorization_.

{{< admonition type="caution" >}}
Disable `auth` only in testing environments.
{{< /admonition>}}

## Examples

```sh
kes server --config config.yml --auth=off
```