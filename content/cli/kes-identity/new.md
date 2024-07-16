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

The output of the command resembles the following:

```shell
Your API key:

   kes:v1:ABuhW1PU/dL1VL41trsQJzYYFMV5FfAcoF7NHu1U9ckk

This is the only time it is shown. Keep it secret and secure!

Your Identity:

   5f1c9dfec3a190f8c3f07d417c223243042fdf8a1df08cfc952a57ee5dc7288e

The identity is not a secret. It can be shared. Any peer
needs this identity in order to verify your API key.

The identity can be computed again via:

    kes identity of kes:v1:ABuhW1PU/dL1VL41trsQJzYYFMV5FfAcoF7NHu1U9ckk
```

## Syntax


```sh
kes identity new
             [--cert <path>]
             [--dns <domain>]
             [--encrypt]
             [--expiry <duration>]
             [--force, -f]
             [--ip <ip>]
             [--key <path>]
             [<subject>]
```

## Parameters

### `--cert`

_Optional_

Path to the public certificate for the new identity.

Use with the ``--key`` flag.

### `--dns`

_Optional_

Specify a domain name to use as a subject alternate name (SAN) for the identity.
You can repeat the flag to add multiple domain names as SANs.

Requires the `--key` and `--cert` flags.

### `--encrypt`

Encrypt the private key with a password.

Requires the `--key` and `--cert` flags.

### `--expiry`

Number of hours in `#h` format until the certificate expires.

Requires the `--key` and `--cert` flags.

If not specified, the certificate expires in `720h` (30 days).

### `--force, -f`

_Optional_

Overwrite any existing private key or certificate that may exist for the identity.

### `--ip`

_Optional_

Specify an IPv4 address to use as a subject alternate name (SAN) for the identity.
You can repeat the flag to add multiple IPs as SANs.

Requires the `--key` and `--cert` flags.

### `--key`

_Optional_

Specify the path to the file for the private key to use for the new identity.

Use with the ``--cert`` flag.

### `subject`

_Optional_

The name to use for the identity.
If not specified, KES automatically generates an identity.

## Examples

Create an identity with the default expiration that uses the default path for the key and certificate locations.

```sh {.copy}
$ kes identity new
```

Create an identity that uses either of two IP addresses as a subject alternate name (SAN).

```sh {.copy}
$ kes identity new --ip "192.168.0.182" --ip "10.0.0.92" --key private.key --cert public.crt Client-1
```

Create an encrypted identity that expires in the default time of 30 days.

```sh {.copy}
$ kes identity new --key client1.key --cert client1.crt --encrypt Client-1
```

Create an encrypted identity, `Client-365`, that expires in 1 year (8760 hours).

```sh {.copy}
$ kes identity new --key server.key --cert server.crt --encrypt --expiry 8760h
```
