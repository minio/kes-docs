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

List all policies:

```sh {.copy}
kes policy ls
```

List some policies that follow a specified pattern:

```sh {.copy}
kes policy ls 'my-policy*'
```