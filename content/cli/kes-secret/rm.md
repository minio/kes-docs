---
title: kes secret rm
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Remove a secret name from the KES server.
Once removed, the secret is no longer valid for the KES server.

## Syntax

```sh
kes secret rm                       \
           [--insecure, -k]         \
           [--enclave, -e <name>]   \
           <name>
```

## Parameters

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.

### `--enclave, -e`

_Optional_

The short name of the KES enclave to output information about.

### `name`

**Required**

The short name of the secret to remove.

## Examples

```sh {.copy}
kes secret rm my-secret
```