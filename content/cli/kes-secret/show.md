---
title: kes secret show
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Output the contents of a secret.

## Syntax

```sh
kes secret show                     \
           <name>                   \
           [--color <string>]       \
           [--insecure, -k]         \
           [--json]                 \
           [--plain, -p]
```

## Parameters

### `name`

_Required_

The short name of the secret to remove.

### `--color`

{{< include "_includes/params/color.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

### `--json`

{{< include "_includes/params/json.md" >}}

### `--plain, -p`

Output the raw secret with no styling.

## Examples

```sh {.copy}
kes secret show my-secret
```
