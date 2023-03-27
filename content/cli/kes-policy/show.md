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
kes policy show
           [--insecure, -k]
           [--enclave, -e <name>]
           [--json]
           <name>
```

## Parameters

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.

### `--enclave, -e`

_Optional_

The short name of the KES enclave to output information about.

### `--json`

_Optional_

Output the results in JSON format.

### `name`

**Required**

The short name of the policy about which to output information.

## Examples

```sh {.copy}
kes policy show my-policy
```