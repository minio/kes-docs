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
        [--insecure, -k]   \
        [--json]
```

## Parameters

### `name`

{{< include "_includes/params/name.md" >}}

### `--color`

{{< include "_includes/params/color.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

### `--json`

{{< include "_includes/params/json.md" >}}


## Examples

```sh {.copy}
kes key info my-key
```