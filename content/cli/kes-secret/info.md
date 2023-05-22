---
title: kes secret info
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Outputs the name, date, and creation information for a specified secret.

The output resembles the following:

```sh
Name        my-secret
Date        2023-03-07 17:17:05
Created by  3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22
```
## Syntax

```sh
kes secret info                     \
           <name>                   \
           [--color <string>]       \
           [--enclave, -e <name>]   \
           [--insecure, -e]         \
           [--json]
```

## Parameters

### `name`

_Required_

The short name of the secret about which to output information.

### `--color`

{{< include "_includes/params/color.md" >}}

### `--enclave, -e`

{{< include "_includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

### `--json`

{{< include "_includes/params/json.md" >}}

## Examples

```sh {.copy}
kes secret info my-secret
```
