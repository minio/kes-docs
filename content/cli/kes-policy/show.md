---
title: kes policy show
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Outputs the contents of the specified policy.
The output includes the allowed operations and creation information.

The output resembles the following:

```sh
Allow:
  · /v1/policy/describe/*
  · /v1/identity/describe/*
  · /v1/identity/self/describe/*
  · /v1/identity/delete/*
  · /v1/identity/list/*
  · /v1/log/audit
  · /v1/log/error
  · /version
  · /v1/api
  · /v1/metrics
  · /v1/status


Created at: 2023-03-07 17:17:05
Created by: 3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22
```

## Syntax

```sh
kes policy show                   \
           <name>                 \
           [--enclave, -e <name>] \
           [--insecure, -k]       \
           [--json]
```

## Parameters

### `name`

_Required_

The short name of the policy about which to output information.

### `--enclave, -e`

{{< include "_includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

### `--json`

{{< include "_includes/params/json.md" >}}

## Examples

```sh {.copy}
kes policy show my-policy
```