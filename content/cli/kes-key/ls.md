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
kes key ls
        [--insecure, -k]
        [--json]
        [--color <string>]
        [--enclave, -e]
        ['pattern']
```

## Parameters

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.

### `--json`

_Optional_

Output the results in JSON format.

### `--color`

_Optional_

Specify when to use colored output. 
Possible values: `auto`, `never`, `always`

`auto` enables colors if an interactive terminal is detected and disables colors if the output goes to a pipe.

If not defined, KES uses the `auto` method.

### `--enclave, -e`

_Optional_

The short name of the KES enclave to output information about.

### `pattern`

_Optional_

A string surrounded by single quotes to match when listing keys.

## Examples

List all cryptographic keys for the KES server.

```sh
kes key ls
```

List cryptographic keys for the KES server that start with `my-key`.

```sh
kes key ls 'my-key*'
```
