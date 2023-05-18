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

kes identity rm                     \
             [--enclave, -e <name>] \
             [--insecure, -k]

## Parameters

### `--enclave, -e`

{{< include "_includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

## Examples

```sh
kes identity rm 736bf58626441e3e134a2daf2e6a8441b40e1abc0eac510878168c8aac9f2b0b
```
