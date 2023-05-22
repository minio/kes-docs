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
        <name>                  \
        <key>                   \
        [--enclave, -e <name>]  \
        [--insecure, -k]
```

## Parameters

### `name`

{{< include "_includes/params/name.md" >}}

### `key`

_Required_

Key to use to decrypt the import file.

### `--enclave, -e`

{{< include "_includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}


## Examples

Import an encrypted key as `my-key-2`.

```sh {.copy}
kes key import my-key-2 Xlnr/nOgAWE5cA7GAsl3L2goCvmfs6KE0gNgB1T93wE=
```