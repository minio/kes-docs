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
kes enclave rm                  \
            [--insecure, -k]    \
            <name>
```

## Parameters

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.

### `name`

**Required**

The short name of the KES enclave to output information about.

## Examples

The following command deletes the KES enclave named `tenant-1`.

```sh
kes enclave rm tenant-1
```