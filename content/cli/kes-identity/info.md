---
title: kes identity info
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Displays information about an identity on the KES server.

The output resembles the following:

```sh
Identity    3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22
Created At  2023-02-15 07:59:37
Role        Admin
```

## Syntax

```sh
kes identity info 
            [-k, --insecure]
            [--json]
            [--color <string>]
            [-e, --enclave <name>]
            [<identity>]
```

## Parameters

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.

### `--json`

Output the results in JSON format.

### `--color`

Specify when to use colored output. 
Possible values: `auto`, `never`, `always`

`auto` enables colors if an interactive terminal is detected and disables colors if the output goes to a pipe.

If not defined, KES uses the `auto` method.

### `--enclave, -e`

_Optional_

The short name of the KES enclave to output information about.

### `identity`

_Optional_

The UUID of a specific identity to retrieve information about.

## Examples

The following command displays the identity information for the enclave named `tenant-1`.

```sh
kes identity infox`
```

```sh
kes identity info 3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22
```
