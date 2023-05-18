---
title: kes key encrypt
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Encrypt the contents of a plaintext data encryption key with a key.

The plaintext value of a data encryption key can be used to encrypt or decrypt data.

{{< admonition type="caution">}}
Avoid storing the plaintext on disk, as it allows decryption of data without requiring access to the Secret key used to generate the DEK.
{{< /admonition>}}

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

{{< include "_includes/params/name.md" >}}

### `message`

_Required_

The string to encrypt.

### `--enclave, -e`

{{< include "_includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

## Examples

```sh {.copy}
kes key encrypt my-key "Hello world"
```