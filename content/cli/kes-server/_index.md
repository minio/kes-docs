---
title: kes server
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

The :mc:`kes server` command starts a MinIO Key Encryption Server (KES) server.
The :mc:`kes server` handles requests for creating and retrieving cryptography keys from a supported Key Management System (KMS). 
KES is a required component for enabling Server-Side Object Encryption in MinIO deployments.

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

### `--auth`

Controls how the server handles mTLS authentication.

By default, the server requires a client certificate and verifies that certificate has been issued by a trusted certificate authority.

- Require a certificate and verify its validity: `--auth=on` (default)
- Require a certificate, but do not verity its validity `--auth=off`

If turned off, the client accepts arbitrary certificates, but continues to map them to policies.
This disables _authentication_, but does **not** disable _authorization_.

{{< admonition type="caution" >}}
Disable `auth` only in testing environments.
{{< /admonition>}}

### `--cert`

Path to the TLS certificate.

If also present in the specified config file, the `cert` entered here takes precedence.

### `--config`

Path to the YAML-formatted config file to use for the KES server.

### `--key`

Path to the KES server private key that corresponds to the X.509 server certificate.

If also present in the specified config file, the `key` entered here takes precedence.


## Examples

```sh
kes server --config config.yml --auth=off
```