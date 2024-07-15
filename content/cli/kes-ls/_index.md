---
title: kes ls
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

{{< admonition title="Replaces deprecated commands" type="note" >}}
The `kes ls` command replaces the following commands, which are deprecated:

- `kes key ls`
- `kes policy ls`
- `kes identity ls`
{{< /admonition >}}

## Overview

Returns a list of keys, policies, or identities.

## Syntax

```sh
kes ls                         \
    --api-key, -a <string>     \
    --server, -s <HOST[:PORT]> \
    --json                     \
    --identity, -i             \
    --policy, -p               \
    --insecure, -k
```

## Parameters

### `--api-key, -a`

*Optional*

API key to use to authenticate to the KES Server.
Defaults to the value in the `$MINIO_KES_API_KEY` environment variable.

### `--server, -s`

*Optional*

The `HOST[:PORT]` of the KES server to connect to.
Defaults to the value in the `$MINIO_KES_SERVER` environment variable.

### `--json`

*Optional*

Print the output in JSON format.

### `--identity, -i`

*Optional*

Print a list of identities.

### `--policy, -p`

*Optional*

Print a list of policies.

### `--insecure, -k`

*Optional*

Skip verification of the server's certificate.
