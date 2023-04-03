---
title: kes status
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Display the status of the KES server.

## Syntax

```sh
kes status              \
    [--api]             \
    [--color <string>]  \
    [--insecure, -k]    \
    [--json]            \
    [--short, -s]
```

## Parameters

### `--api`

List all server APIs.

### `--color`

{{< include "includes/params/color.md" >}}

### `--insecure, -k`

{{< include "includes/params/insecure.md" >}}

### `--json`

{{< include "includes/params/json.md" >}}

### `--short, -s`

Output a summary of the server status rather than the full information.

## Examples

```sh {.copy}
kes status
```
