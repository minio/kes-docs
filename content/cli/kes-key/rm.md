---
title: kes key rm
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Remove a key from the KES server.

Once removed, the key can no longer be used.

## Syntax

```sh
kes key rm                  \
        [--insecure, -k]    \
        [--enclave, -e]     \
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

The name of the existing key to remove.
To remove more than one key, separate each key with a space.

## Examples

Remove a key:

```sh {.copy}
kes key rm my-key
```

Remove two keys at the same time:

```sh {.copy}
kes key rm my-key1 my-key2
```
