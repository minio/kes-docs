---
title: kes policy ls
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

{{< admonition title="Command deprecated" type="important" >}}
The `kes identity ls` command has been deprecated as of KES release `2024-06-17T15-47-05Z`.
Use [`kes ls`]({{< relref "/cli/kes-ls/" >}}) instead.
{{< /admonition >}}

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
           [--insecure, -k]         \
           [--json]                 \
           [<'pattern'>]
```

## Parameters

### `--color`

{{< include "_includes/params/color.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

### `--json`

{{< include "_includes/params/json.md" >}}

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