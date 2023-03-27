---
title: kes key create
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Add a new crytographic key.

## Syntax

```sh
kes key create                  \
        [--insecure, -k]        \
        [--enclave, -e <name>]  \
        <name>
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

A name to use for the cryptographic key.
You may add multiple names to a single command to generate multiple keys.

## Examples

```sh {.copy}
kes key create my-key
```

```sh {.copy}
kes key create my-key1 my-key2
```