---
title: kes policy create
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Create a new policy to use with KES identities.

## Syntax

```sh
kes policy create
            [--insecure, -k]
            [--enclave, -e <name>]
            <name>
            <path>
```

## Parameters

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.

### `--enclave, -e`

_Optional_

The short name of the KES enclave for the operation.

### `name`

**Required**

A short name to use to refer to the policy.

### `path`

The path to the file containing the policy to use with this name.

## Examples

```sh {.copy}
kes policy add my-policy ./policy.json
```

## Sample Policy Config File

A yaml-formatted file could resemble the following:

```yaml
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