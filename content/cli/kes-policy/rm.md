---
title: kes policy rm
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Remove a policy name from the KES server.
Removing a policy prevents clients authenticating with an identity associated to that policy from performing any operations on the KES server.

## Syntax

```sh
kes policy rm                       \
           <name>                   \
           [--enclave, -e <name>]   \
           [--insecure, -k]
```

## Parameters

### `name`

_Required_

The short name of the policy to remove.
To remove more than one policy name, separate multiple policy names with commas.

### `--enclave, -e`

{{< include "_includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

## Examples

Remove a policy:

```sh {.copy}
kes policy rm my-policy
```

Remove two policies:

```sh {.copy}
kes policy rm my-policy1, my-policy2
```