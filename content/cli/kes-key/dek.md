---
title: kes key dek
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Generate a new data encryption key.

The output of the command includes both a plaintext key and a ciphertext.
The output resembles the following:

```
plaintext:  kk/+NxO1LHb9ilbai7B9qo60649zNPmSVuJ2akEJFQ4=
ciphertext: lbFBRVMyNTYtR0NNX1NIQTI1NtkgMTRlYjE3YWVjMTBjZDMxYTZiYzAwNmJhODFkNjM1ODnEEKOclQFBMYNZ3dVJPCrldAHEDLkZD9YgLpFW77+8b8Qw7Tn/6tFhyYUoFzS4+jYv8ty/Y5bqKzU6lPUEq/O8xEnYs92wEyvdSfTpTDEH8a8Q
```

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

{{< include "includes/params/name.md" >}}

### `context`

_Optional_

The context value to scope the request for a data encryption key.

### `--enclave, -e`

{{< include "includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "includes/params/insecure.md" >}}

## Examples

```sh
kes key dek my-key
```