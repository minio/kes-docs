---
title: kes key decrypt
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Decrypt the contents of a data encryption key and return the plaintext value.

Use the plaintext value for encrypting or decrypting data using the DEK. 

{{< admonition type="caution">}}
Avoid storing the plaintext value of a DEK on disk, as it allows decryption of data without requiring access to the secret key used to generate the DEK.
{{< /admonition>}}

## Syntax

```sh
kes key decrypt                 \
        <name>                  \
        <ciphertext>            \
        [<context>]             \
        [--enclave, -e <name>]  \
        [--insecure,-k]
```

## Parameters

### `name`

{{< include "includes/params/name.md" >}}

### `ciphertext`

_Required_

The encrypted text string to decrypt.

### `context`

_Optional_

The context value to scope the request for a data encryption key.

You create contexts in the `kubeconfig` file of a Kubernetes deployment to define a set of cluster, namespace, and user configuration to use.

### `--enclave, -e`

{{< include "includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "includes/params/insecure.md" >}}

## Examples

The following two commands retrieve the ciphertext for a key using the `kes key dek` command and store the text as a variable.
The second command then decrypts the ciphertext using the key `my-key`.

```sh {.copy}
$ CIPHERTEXT=$(kes key dek my-key | jq -r .ciphertext)
$ kes key decrypt my-key "$CIPHERTEXT"
```