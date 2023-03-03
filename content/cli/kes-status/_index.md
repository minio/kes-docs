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
    [--insecure, -k]    \
    [--short, -s]       \
    [--api]             \
    [--json]            \
    [--color <string>]
```

## Parameters

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.

### `--short, -s`

Output a summary of the server status rather than the full information.

### `--api`

List all server APIs.

### `--json`

_Optional_

Output the information in JSON format.

### `--color`

_Optional_

Specify when to use colored output. 
Possible values: `auto`, `never`, `always`

`auto` enables colors if an interactive terminal is detected and disables colors if the output goes to a pipe.

If not defined, KES uses the `auto` method.

## Examples

```sh {.copy}
kes status
```
