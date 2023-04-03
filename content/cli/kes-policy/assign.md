---
title: kes policy assign
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Assign a KES policy to identities.

## Syntax

```sh
kes policy assign                   \
           <policy>                 \
           <identity>               \
           [--enclave, -e <name>]   \
           [--insecure, -k]
```

## Parameters

## `policy`

The name of the policy to add to the identity.

Use `kes policy ls` to find the name.

## `identity`

The name of the identity to which to assign the policy.

### `--enclave, -e`

{{< include "includes/params/enclave.md" >}}

### `--insecure, -k`

{{< include "includes/params/insecure.md" >}}

## Examples

```sh {.copy}
kes policy assign my-policy 032dc24c353f1baf782660635ade933c601095ba462a44d1484a511c4271e212
```
