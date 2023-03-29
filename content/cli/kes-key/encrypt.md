---
title: kes key encrypt
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Encrypt a message with a key.

## Syntax

```sh
kes key encrypt                \
        <name>                 \
        <message>              \
        [--enclave, e <name>]  \
        [--insecure,-k]
```

## Parameters

### `name`

{{< include "includes/params/name.md" >}}

### `message`

_Required_

The string to encrypt.

### `--enclave, -e`

{{< include "includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "includes/params/insecure.md" >}}

## Examples

```sh {.copy}
kes key encrypt my-key "Hello world"
```