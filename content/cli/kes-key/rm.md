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
kes key rm                \
        <name>            \
        [--enclave, -e]   \
        [--insecure, -k]
```

## Parameters

### `name`

_Required_

The name of the existing key to remove.
To remove more than one key, separate each key with a space.

### `--enclave, -e`

{{< include "includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "includes/params/include.md" >}}

## Examples

Remove a key:

```sh {.copy}
kes key rm my-key
```

Remove two keys at the same time:

```sh {.copy}
kes key rm my-key1 my-key2
```
