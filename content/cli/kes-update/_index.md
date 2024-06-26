---
title: kes update
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Update the KES binary to a different version.

## Syntax

```sh
kes update                      \
        [--arch <string>]       \
        [--downgrade, -d]       \
        [--insecure, -k]        \
        [--minisign-key <key>]  \
        [--os <string>]         \
        [--output, -o <path>]   \
        [<version>]
```

## Parameters

### `--arch`

Download the binary for the specified system architecture.

Valid architectures:

- `amd64`
- `arm64`
- `ppc64le`
 
  Valid only for the Linux operating system.
- `s390x`
 
  Valid only for the Linux operating system.

### `--downgrade, -d`

Allow the new binary to be a previous version.

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

### `--minisign-key`

Verify the downloaded binary with the specified minisign public key.

### `--os`

Download the binary for the specified operating system.

Valid operating systems:

- `darwin` 

  Use for macOS.
- `linux`
- `windows`

### `--output, -o`

Save the new binary to the specified file path instead of replacing the current KES binary.

## Examples

Download the latest binary and replace the current one:

```sh {.copy}
kes update
```

Download a specific binary version and replace the current one:

```sh {.copy}
kes update v0.21.0
```

Download an older binary version and replace the current one:

```sh {.copy}
kes update --downgrade v.0.19.0
```

Download the latest binary for macOS on an `arm64` chip like the M2 and save it to a file, keeping the current binary in place:

```sh {.copy}
kes update -o ./kes-darwin-arm64 --os darwin --arch arm64
```
