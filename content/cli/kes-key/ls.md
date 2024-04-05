---
title: kes key ls
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Return a list of existing cryptographic keys.

Output resembles the following:

```sh
Date Created        Key
     <unknown>      minio-s1
     <unknown>      minio-sse-key
     <unknown>      my-key-1
     <unknown>      my-minio-key
     <unknown>      my-minio-sse-kms-key
     <unknown>      my-minio-sse-s3-key
```

## Syntax

```sh
kes key ls                  \
        [--color <string>]  \
        [--insecure, -k]    \
        [--json]            \
        [<pattern>]
```

## Parameters

### `--color`

{{< include "_includes/params/color.md" >}}

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

### `--json`

{{< include "_includes/params/json.md" >}}

### `pattern`

_Optional_

A string surrounded by single quotes to match when listing keys.

## Examples

List all cryptographic keys for the KES server.

```sh {.copy}
kes key ls
```

List cryptographic keys for the KES server that start with `my-key`.

```sh {.copy}
kes key ls 'my-key*'
```
