---
title: kes key info
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Return the name, ID, and creation information about a cryptographic key.

Output resembles the following:

```sh
Name        my-key
ID          14eb17aec10cd31a6bc006ba81d63589
Created At  2023-03-09 18:16:11
Created By  3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22
```

## Syntax

```sh
kes key info               \
        <name>             \
        [--color <string>] \
        [--enclave, -e]    \
        [--insecure, -k]   \
        [--json]
```

## Parameters

### `name`

{{< include "includes/params/name.md" >}}

### `--color`

{{< include "includes/params/color.md" >}}

### `--enclave, -e`

{{< include "includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "includes/params/insecure.md" >}}

### `--json`

{{< include "includes/params/json.md" >}}


## Examples

```sh {.copy}
kes key info my-key
```