---
title: kes policy info
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Outputs the name, date, and creation information for a specified policy.

The output resembles the following:

```sh
Name        my-app
Date        2023-03-07 17:17:05
Created by  3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22
```

## Syntax

```sh
kes policy info                     \
           <name>                   \
           [--color <string>]       \
           [--enclave, -e <name>]   \
           [--insecure, -k]         \
           [--json]
```

## Parameters

### `name`

_Required_

The short name of the policy about which to output information.

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
kes policy info my-policy
```