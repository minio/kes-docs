---
title: kes ls
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

{{< admonition type="note" >}}
The `kes ls` command replaces the following [deprecated commands]({{< relref "/cli/deprecated/_index.md" >}}):

- `kes key ls`
- `kes policy ls`
- `kes identity ls`
{{< /admonition >}}

## Overview

Returns a list of keys, policies, or identities.

If the command does not specify to list policies or identities, the command returns a list of the names of keys for the KES server.


## Syntax

```sh
kes ls                                 \
    --api-key, -a <string>             \
    --server, -s <HOST[:PORT]>         \
    --json                             \
    [ --identity, -i | --policy, -p ]  \
    --insecure, -k
```

## Parameters

### `--api-key, -a`

*Optional*

API key to use to authenticate to the KES Server.
If not provided, the command uses the value in the [`$MINIO_KES_API_KEY`]({{< relref "/concepts/environment-variables/#minio_kes_api_key" >}}) environment variable.

### `--server, -s`

*Optional*

The `HOST[:PORT]` of the KES server to connect to.
If not provided, the command uses the value in the [`$MINIO_KES_SERVER`]({{< relref "/concepts/environment-variables/#minio_kes_server" >}}) environment variable.

### `--json`

*Optional*

Print the output in JSON format.

### `--identity, -i`

*Optional*

Print a list of identities.
When used, the command returns only a list of the identities.

This option is mutually exclusive with `--policy`.
You can use one or the other, but not both at the same time.

### `--policy, -p`

*Optional*

Print a list of policies names.
When used, the command returns only a list of the policies.

This option is mutually exclusive with `--identity`.
You can use one or the other, but not both at the same time.

### `--insecure, -k`

*Optional*

Skip verification of the server's certificate.
