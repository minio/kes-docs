---
title: kes key rm
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Remove a key from the KES server.

Removing a Secret key prevents decrypting any cryptographic keys derived using that Secret key, which in turn prevents decrypting any objects encrypted with those cryptographic keys. 

{{< admonition type="warning">}}
Removing a Secret Key renders all data encrypted using that key permanently unreadable.
{{< /admonition>}}

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

{{< include "_includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

## Examples

Remove a key:

```sh {.copy}
kes key rm my-key
```

Remove two keys at the same time:

```sh {.copy}
kes key rm my-key1 my-key2
```
