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
        [--insecure, -k]        \
        [--enclave, -e <name>]  \
        <name>                  \
        [<context>]
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

The short identifier for the key to use for the data encryption key.

### `context`

_Optional_

The context value to scope the request for a data encryption key.

## Examples

```sh
kes key dek my-key
```