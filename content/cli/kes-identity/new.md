---
title: kes identity new
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Create a new KES identity.

{{< admonition type="tip" >}}
You cannot add identities to a stateless KES implementation with this command.
Instead, define the identities for stateless implementations in the [config file]({{< relref "/tutorials/configuration#config-file" >}}).
{{< /admonition >}}

## Syntax

kes identity new
             [--key <path>]
             [--cert <path>]
             [--force, -f]
             [--ip <ip>]
             [--dns <domain>]
             [--expiry <duration>]
             [--encrypt]
             subject

## Parameters

### `--key`

_Optional_

Specify the path to the file for the private key for the new identity.

If not specified, KES assumes the key can be found at `./private.key`.

### `--cert`

_Optional_

Path to the public certificate for the new identity.

If not specified, KES assumes the certificate is located at `./public.crt`.

### `--force, -f`

_Optional_

Overwrite any existing private key or certificate that may exist for the identity.

### `--ip`

_Optional_

Specify an IPv4 address to use as an subject alternate name (SAN) for the identity.
You can repeat the flag to add multiple IPs as SANs.

### `--dns`

_Optional_

Specify a domain name to use as a subject alternate name (SAN) for the identity.
You can repeat the flag to add multiple domain names as SANs.

### `--expiry`

Number of hours in `#h` format until the certificate expires.

If not specified, the certificate expires in `720h` (30 days).

### `--encrypt`

Encrypt the private key with a password.

### `subject`

**Required**

The name to use for the identity.

## Examples

Create an identity with the default expiration that uses the default path for the key and certificate locations.

```sh {.copy}
$ kes identity new Client-1
```

Create an identity that uses either of two IP addresses as a subject alternate name (SAN).

```sh {.copy}
$ kes identity new --ip "192.168.0.182" --ip "10.0.0.92" Client-1
```

Create an encrypted identity that expires in the default time of 30 days.

```sh {.copy}
$ kes identity new --key client1.key --cert client1.crt --encrypt Client-1
```

Create an encrypted identity, `Client-365`, that expires in 1 year (8760 hours).

```sh {.copy}
$ kes identity new --key client365.key --cert client365.crt --encrypt Client-365 --expiry 8760h
```
