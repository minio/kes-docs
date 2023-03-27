---
title: kes key decrypt
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Decrypt the contents of a message with a key.

## Syntax

```sh
kes key decrypt                 \
        [--insecure,-k]         \
        [--enclave, e <name>]   \
        <name>                  \
        <ciphertext>            \
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

### `ciphertext`

**Required**

The encrypted text string to decrypt.

### `context`

_Optional_

The context value to scope the request for a data encryption key.

## Examples

The following two commands retrieve the ciphertext for a key using the `kes key dek` command and store the text as a variable.
The second command then decrypts the ciphertext using the key `my-key`.

```sh {.copy}
$ CIPHERTEXT=$(kes key dek my-key | jq -r .ciphertext)
$ kes key decrypt my-key "$CIPHERTEXT"
```