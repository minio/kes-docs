---
title: kes identity info
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Displays information about an identity on the KES server.

The output resembles the following:

```sh
Identity    3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22
Created At  2023-02-15 07:59:37
Role        Admin
```

## Syntax

```sh
kes identity info                   \
            [--color <string>]      \
            [--enclave, -e <name>]  \
            [<identity>]            \
            [--insecure, -k]        \
            [--json]
```

## Parameters

### `--color`

{{< include "_includes/params/color.md" >}}

### `--enclave, -e`

{{< include "_includes/params/enclave.md" >}}

### `identity`

_Optional_

The UUID of a specific identity to retrieve information about.

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

### `--json`

{{< include "_includes/params/json.md" >}}

## Examples

The following command displays the identity information for the enclave named `tenant-1`.

```sh {.copy}
kes identity info`
```

```sh {.copy}
kes identity info 3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22
```
