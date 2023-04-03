---
title: kes key create
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Add a new crytographic key and store it on the configured Key Management System.
KES *never* returns the generated secret to clients.

## Syntax

```sh
kes key create                  \
        <name>                  \
        [--enclave, -e <name>]  \
        [--insecure, -k]
```

## Parameters

### `name`

{{< include "includes/params/name.md" >}}

You may add multiple names to a single command to generate multiple keys.

### `--enclave, -e`

{{< include "includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "includes/params/insecure.md" >}}


## Examples

```sh {.copy}
kes key create my-key
```

```sh {.copy}
kes key create my-key1 my-key2
```