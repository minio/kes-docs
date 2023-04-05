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
           [--enclave, -e <name>]   \
           [--insecure, -k]         \
           [--json]                 \
           [--plain, -p]
```

## Parameters

### `name`

_Required_

The short name of the secret to remove.

### `--color`

{{< include "includes/params/color.md" >}}

### `--enclave, -e`

{{< include "includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "includes/params/insecure.md" >}}

### `--json`

{{< include "includes/params/json.md" >}}

### `--plain, -p`

Output the raw secret with no styling.

## Examples

```sh {.copy}
kes secret show my-secret
```
