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
           [--insecure, -k]         \
           [--json]                 \
           [--color <string>]       \
           [--enclave, -e <name>]   \
           <'pattern'>
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