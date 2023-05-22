---
title: kes key dek
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Generate a new data encryption key (DEK) from a secret key on the KES server.

The output of the command includes both a plaintext key and a ciphertext representation.
The output resembles the following:

```
plaintext:  kk/+NxO1LHb9ilbai7B9qo60649zNPmSVuJ2akEJFQ4=
ciphertext: lbFBRVMyNTYtR0NNX1NIQTI1NtkgMTRlYjE3YWVjMTBjZDMxYTZiYzAwNmJhODFkNjM1ODnEEKOclQFBMYNZ3dVJPCrldAHEDLkZD9YgLpFW77+8b8Qw7Tn/6tFhyYUoFzS4+jYv8ty/Y5bqKzU6lPUEq/O8xEnYs92wEyvdSfTpTDEH8a8Q
```

To encrypt or decrypt the keys, use `kes key encrypt` or `kes key decrypt`.

{{< admonition type="caution">}}
Avoid storing the plaintext value of a DEK on disk, as it allows decryption of data without requiring access to the secret key used to generate the DEK.
{{< /admonition>}}

## Syntax

```sh
key key dek
        <name>                  \
        [<context>]             \
        [--enclave, -e <name>]  \
        [--insecure, -k]
```

## Parameters

### `name`

{{< include "_includes/params/name.md" >}}

### `context`

_Optional_

The context value to scope the request for a data encryption key.

You create contexts in the `kubeconfig` file of a Kubernetes deployment to define a set of cluster, namespace, and user configuration to use.

### `--enclave, -e`

{{< include "_includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

## Examples

```sh
kes key dek my-key
```