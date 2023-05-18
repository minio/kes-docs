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
            <name>              \
            [--color <string>]  \
            [--insecure, -k]    \
            [--json]
```

## Parameters

### `name`

_Required_

The short name of the KES enclave to output information about.

### `--color`

{{< include "_includes/params/color.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

### `--json`

{{< include "_includes/params/json.md" >}}


## Examples

The following command displays the identity information for the enclave named `tenant-1`.

```sh
kes enclave info tenant-1
```
