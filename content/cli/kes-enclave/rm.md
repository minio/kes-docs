---
title: kes enclave rm
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Deletes an enclave from KES.

## Syntax

```sh
kes enclave rm                \
            <name>            \
            [--insecure, -k] 
```

## Parameters

### `name`

_Required_

The short name of the KES enclave to output information about.

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

## Examples

The following command deletes the KES enclave named `tenant-1`.

```sh {.copy}
kes enclave rm tenant-1
```