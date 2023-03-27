---
title: kes key import
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Import a cryptographic key.

## Syntax

```sh
kes key import                  \
        [--insecure, -k]        \
        [--enclave, -e <name>]  \
        <name>                  \
        <key>
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

The short identifier to use for the key after import.

### `key`

**Required**

Key to use to decrypt the import file.

## Examples

Import an encrypted key as `my-key-2`.

```sh {.copy}
kes key import my-key-2 Xlnr/nOgAWE5cA7GAsl3L2goCvmfs6KE0gNgB1T93wE=
```