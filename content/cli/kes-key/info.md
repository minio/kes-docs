---
title: kes key info
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Return the name, ID, and creation information about a cryptographic key.

Output resembles the following:

```sh
Name        my-key
ID          14eb17aec10cd31a6bc006ba81d63589
Created At  2023-03-09 18:16:11
Created By  3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22
```

## Syntax

```sh
kes key info
        [--insecure, -k]
        [--json]
        [--color <string>]
        [--enclave, -e]
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

### `--enclave, -e`

_Optional_

The short name of the KES enclave to output information about.

### `name`

**Required**

The name of the existing key to describe.
You can only specify one key.

## Examples

```sh {.copy}
kes key info my-key
```