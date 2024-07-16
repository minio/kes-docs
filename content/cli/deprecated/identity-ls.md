---
title: kes identity ls
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

List the identities for the KES server.
If specified, list only the identities that match the specified pattern.

{{< admonition type="note">}}
The `kes identity ls` command does not return admin identities.
{{< /admonition >}}

## Syntax

```sh
kes identity ls                         \
             [--color <string>]         \
             [--insecure, -k]           \
             [--json]                   \
             [pattern]
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

A string surrounded by single quotes to match when listing identities.

## Examples

```sh {.copy}
kes identity ls
```

```sh {.copy}
kes identity ls 'b804befd'
```
