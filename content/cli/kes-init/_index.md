---
title: kes init
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Starts a stateful KES server or cluster.

## Syntax

```sh
kes init            \
    --config <PATH> \
    --force, -f
```

## Parameters

### `--config`

Path to the [configuration file]({{< relref "/tutorials/configuration#config-file" >}}) to use for the server or cluster.

### `--force, -f`

Overwrite any existing data.

## Examples

Start a stateful KES server using the `init.yml` configuration file using the path `~/kes`.

```sh {.copy}
kes init --config init.yml ~/kes
```