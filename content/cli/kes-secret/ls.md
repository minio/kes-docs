---
title: kes secret ls
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Display a list of secrets on the KES server.

You can display a list of all secrets or a list that match a specific pattern.

## Syntax

```sh
kes secret ls                       \
           [--color <string>]       \
           [--enclave, -e <name>]   \
           [--insecure, -k]         \
           [--json]                 \
           [<'pattern'>]
```


## Parameters


### `--color`

{{< include "_includes/params/color.md" >}}

### `--enclave, -e`

{{< include "_includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

### `--json`

{{< include "_includes/params/json.md" >}}

### `pattern`

_Optional_

A single-quote bounded string to use to find matching policies.
Only the policies matching the specified string display.

## Examples

List all secrets:

```sh {.copy}
kes secret ls
```

List secrets that begin with the string `my-secret`:

```sh {.copy}
kes secret ls 'my-secret*'
```