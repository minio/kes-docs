---
title: kes secret show
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Output the contents of a secret.

## Syntax

```sh
kes secret show
           [--insecure, -k]
           [--plain, -p]
           [--json]
           [--color <string>]
           [--enclave, -e <name>]
           <name>
```

## Parameters

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.

### `--plain, -p`

Output the raw secret with no styling.

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

The short name of the secret to remove.

## Examples

```sh {.copy}
kes secret show my-secret
```
