---
title: kes server
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

The `kes server` command starts a MinIO Key Encryption Server (KES) server.
The `kes server` handles requests for creating and retrieving cryptography keys from a supported Key Management System (KMS). 
KES is a required component for enabling Server-Side Object Encryption in MinIO deployments.

Defaults to using `0.0.0.0:7373` unless specified in the [config]({{< relref "/tutorials/configuration#config-file" >}}) file or the `--addr` parameter.

## Syntax

```sh
kes server              \
    --addr <IP:PORT>    \
    --config <path>     \
    [--dev] 
```

## Parameters

### `--addr`

The IP address and port to use for the server.

If not specified, the default value is `0.0.0.0:7373`.

### `--config`

Path to the YAML-formatted config file to use for the KES server.

### `--dev`

Create a development server for quick tests on `127.0.0.1:7373`.
This flag does not require a configuration file, TLS cert generation, or other setup.

Keys are ephemeral and stored in memory.

The output of the flag includes the API key to use on the KES client during testing.
Output resembles the following:

```shell

Version     2023-11-09T17-35-47Z    commit=53b74e38697bc68fd88dff7a3cf431db692db9ef
Runtime     go1.21.4 darwin/arm64   compiler=gc
License     AGPLv3                  https://www.gnu.org/licenses/agpl-3.0.html
Copyright   MinIO, Inc.  2015-2023  https://min.io/

KMS         In Memory
API         · https://127.0.0.1:7373/
            · https://192.168.188.79:7373/

Docs        https://min.io/docs/kes

API Key     kes:v1:ADsGCjJoWziQ82wPUG6oHbqhhlbkajaRGP+3+JSfx5Wq
Admin       7bbffa635fc160ef8048a344a53aab54e472e5c654c6339a9cec9223301808c7
Logs        error=stderr level=INFO
            audit=stdout level=INFO

=> Server is up and running...
```

Use the API address and the API key as environment variables on your KES client:

```shell
$ export KES_SERVER=https://127.0.0.1:7373/
$ export KES_API_KEY=kes:v1:ADsGCjJoWziQ82wPUG6oHbqhhlbkajaRGP+3+JSfx5Wq

$ kes key ls -k
```

## Examples

### Start the KES Server

Start a new KES server with a config file on `127.0.0.1:7000`.

```sh
kes server --addr :7000 --config ./kes/config.yml
```

### Create a Development KES Server for testing

Start a new KES server on `127.0.0.1:7373` in development mode.
Keys are volatile and stored in-memory.

```sh
kes server --dev
```

## Deprecated Parameters

### `--auth`

{{< admonition title="Deprecated" type="important" >}}
As of release `2023-11-09T17-35-47Z`, this flag is deprecated.
Use the [config file]({{< relref "/tutorials/configuration#config-file" >}}) to specify the cert instead.
{{< /admonition >}}

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

{{< admonition title="Deprecated" type="important" >}}
As of release `2023-11-09T17-35-47Z`, this flag is deprecated.
Use the [config file]({{< relref "/tutorials/configuration#config-file" >}}) to specify the cert instead.
{{< /admonition >}}

Path to the TLS certificate.

If also present in the specified config file, the `cert` entered here takes precedence.

### `--key`

{{< admonition title="Deprecated" type="important" >}}
As of release `2023-11-09T17-35-47Z`, this flag is deprecated.
Use the [config file]({{< relref "/tutorials/configuration#config-file" >}}) to specify the cert instead.
{{< /admonition >}}

Path to the KES server private key that corresponds to the X.509 server certificate.

If also present in the specified config file, the `key` entered here takes precedence.