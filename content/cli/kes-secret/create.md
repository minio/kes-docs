---
title: kes secret create
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Add a new secret to use on the KES server.

## Syntax

```sh
kes secrete create
            [--insecure, -e]
            [--enclave, -e <name>]
            [--file <path>]
            <name>
            <value>
```

## Parameters

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.

### `--enclave, -e`

_Optional_

The short name of the KES enclave for the operation.

### `--file`

Use the contents of a file as the secret.
Provide the path to the file.

You cannot provide both a **--file** and a **value**.

### `name`

**Required**

A short name to use to refer to the secret.

### `value`

_Optional_

The string to use as the secret.
You cannot provide both a **--file** and a **value**.

If you do not provide a value to use and do not specify **--file**, KES prompts you to enter the secret.

## Examples

Have KES prompt for the secret to use:

```sh {.copy}
kes secret create my-secret-prompt-me
```

Specify the value of the secret in the command:

```sh {.copy}
kes secret create my-secret Ch@ng3-Me
```

Use the contents of a file as the secret:

```sh {.copy}
kes secret create my-secret-from-file ./path/to/file.txt
```
