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
kes policy assign           \
           [--insecure, -k] \
           [--enclave, -e <name>]  \
           <policy>         \
           <identity>
```

## Parameters

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.

### `--enclave, -e`

_Optional_

The short name of the KES enclave for the operation.

## `policy`

The name of the policy to add to the identity.

Use `kes policy ls` to find the name.

## Examples

```sh {.copy}
kes policy assign my-policy 032dc24c353f1baf782660635ade933c601095ba462a44d1484a511c4271e212
```
