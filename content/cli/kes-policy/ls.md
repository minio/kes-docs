---
title: kes policy ls
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Outputs a list of policies on the KES server.

The output resembles the following:

```sh
Date Created        Policy
2023-03-07 17:17:05 my-app
```

## Syntax

```sh
kes policy ls                       \
           [--color <string>]       \
           [--enclave, -e <name>]   \
           [--insecure, -k]         \
           [--json]                 \
           [<'pattern'>]
```

## Parameters

### `--color`

{{< include "includes/params/color.md" >}}

### `--enclave, -e`

{{< include "includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "includes/params/insecure.md" >}}

### `--json`

{{< include "includes/params/json.md" >}}

### `pattern`

_Optional_

A single-quote bounded string to use to find matching policies.
Only the policies matching the specified string display.

## Examples

List all policies:

```sh {.copy}
kes policy ls
```

List some policies that follow a specified pattern:

```sh {.copy}
kes policy ls 'my-policy*'
```