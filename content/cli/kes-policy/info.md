---
title: kes policy info
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Outputs the name, date, and creation information for a specified policy.

The output resembles the following:

```sh
Name        my-app
Date        2023-03-07 17:17:05
Created by  3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22
```

## Syntax

```sh
kes policy info                     \
           [--insecure, -k]         \
           [--json]                 \
           [--color <string>]       \
           [--enclave, -e <name>]   \
           <name>
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

### `name`

**Required**

The short name of the policy about which to output information.

## Examples

```sh {.copy}
kes policy info my-policy
```