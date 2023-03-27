---
title: kes identity rm
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Removes the identity of either an api key or a certificate.

## Syntax

kes identity rm
             [--insecure, -k]
             [--enclave, -e <name>]

## Parameters

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.
### `--enclave, -e`

_Optional_

The short name of the KES enclave for the operation.

## Examples

```sh
kes identity rm 736bf58626441e3e134a2daf2e6a8441b40e1abc0eac510878168c8aac9f2b0b
```
