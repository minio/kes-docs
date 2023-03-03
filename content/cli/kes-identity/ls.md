---
title: kes identity ls
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

List the identities for the KES server.
If specified, list only the identities that match the specified pattern.

{{< admonition type="note">}}
The `kes identity ls` command does not return admin identities.
{{< /admonition >}}

## Syntax

```sh
kes identity ls                         \
             [--insecure, -k]           \
             [--json]                   \
             [--color <string>]         \
             [--enclave, -e <string>]   \
             [pattern]
```

## Parameters

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.

### `--json`

_Optional_

Output the results in JSON format.

### `--color`

_Optional_

Specify when to use colored output. 
Possible values: `auto`, `never`, `always`

`auto` enables colors if an interactive terminal is detected and disables colors if the output goes to a pipe.

If not defined, KES uses the `auto` method.

### `--enclave, -e`

_Optional_

The short name of the KES enclave to output information about.

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
