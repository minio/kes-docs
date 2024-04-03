---
title: kes secret rm
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Remove a secret name from the KES server.
Once removed, the secret is no longer valid for the KES server.

## Syntax

```sh
kes secret rm                       \
           <name>                   \
           [--insecure, -k]
```

## Parameters

### `name`

_Required_

The short name of the secret to remove.

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

## Examples

```sh {.copy}
kes secret rm my-secret
```