---
title: kes policy rm
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Remove a policy name from the KES server.
Once removed, identities linked to the policy no longer have access allowed by the policy.

## Syntax

```sh
kes policy rm                       \
           [--insecure, -k]         \
           [--enclave, -e <name>]   \
           <name>
```

## Parameters

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.

### `--enclave, -e`

_Optional_

The short name of the KES enclave to output information about.

### `name`

**Required**

The short name of the policy to remove.
To remove more than one policy name, separate multiple policy names with commas.

## Examples

Remove a policy:

```sh {.copy}
kes policy rm my-policy
```

Remove two policies:

```sh {.copy}
kes policy rm my-policy1, my-policy2
```