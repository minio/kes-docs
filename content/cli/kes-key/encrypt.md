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
kes key encrypt                 \
        [--insecure,-k]         \
        [--enclave, e <name>]   \
        <name>                  \
        <message>
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

### `message`

**Required**

The string to encrypt.

## Examples

```sh {.copy}
kes key encrypt my-key "Hello world"
```