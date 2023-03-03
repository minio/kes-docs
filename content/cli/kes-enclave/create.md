---
title: kes enclave create
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Creates a new KES enclave.

## Syntax

```sh
kes enclave create              \
            [--insecure, -k]    \
            <name>              \
            <identity>
```

## Parameters

### `--insecure, -k`

Use this during testing and in non-production environments to bypass the TLS validation.

### `<name>`

**Required**

A short, human-readable name to use to interact with the enclave with the KES commands.

### `<identity>`

**Required**

The of the identity to use to create the enclave.

## Examples

The following command creates a new enclave called `tenant-1` with the provided identifier.

```sh
kes enclave create tenant-1 5f2f4ef3e0e340a07fc330f58ef0a1c4d661e564ab10795f9231f75fcfe572f1
```