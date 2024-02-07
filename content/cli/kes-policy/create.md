---
title: kes policy create
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Create a new policy to use with KES identities.

Adds a new temporary policy to the KES server. 
Policies support KES access control.

The created policy has no associated identities. 
Use [`kes policy assign`]({{< relref "cli/kes-policy/assign.md" >}}) to assign identities to the policy. 

All changes made by :mc:`kes policy` are lost when the KES server restarts.
To create permanent policies, modify the `policy` section of the KES [configuration document]({{< relref "tutorials/configuration.md" >}}) to include the new policy.

## Syntax

```sh
kes policy create                  \
            <name>                 \
            <path>                 \
            [--enclave, -e <name>] \ 
            [--insecure, -k]
```

## Parameters

### `name`

_Required_

A short name used to refer to the policy.

### `path`

_Required_

The path to the file containing the policy to use with this name.

### `--enclave, -e`

{{< include "_includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

## Examples

```sh {.copy}
kes policy add my-policy ./policy.json
```

## Sample Policy Config File

A yaml-formatted file could resemble the following:

```yaml {.copy}
policy:
  my-policy:
    allow:
    - /v1/key/create/my-key
    - /v1/key/generate/my-key
    - /v1/key/decrypt/my-key
    identities:
    - 3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22
    - ${MY_APP_IDENTITY}
```