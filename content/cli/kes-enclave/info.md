---
title: kes enclave info
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Prints the identity information for a KES enclave.

## Syntax

```sh
kes enclave info                \
            [--insecure, -k]    \
            [--json]            \
            [--color <string>]  \
            <name>
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

### `name`

**Required**

The short name of the KES enclave to output information about.

## Examples

The following command displays the identity information for the enclave named `tenant-1`.

```sh
kes enclave info tenant-1
```
