---
title: kes log
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Outputs either audit logs or error logs.
The output logs the time, status, identity, IP, endpoint, and latency of each request.

Logs continue to output until you stop the process.

The output resembles the following:

```sh
Time        Status    Identity                IP                 API                               Latency
14:07:15    404       3ecfcdf38fcbe141ae26    8.8.8.8            /v1/key/decrypt/my-first-key      142µs
14:07:38    200       3ecfcdf38fcbe141ae26    8.7.8.7            /v1/key/decrypt/minio-sse-key     299µs
```

## Syntax

```sh
kes log              \
    [--audit]        \
    [--error]        \
    [--insecure, -k] \
    [--json]
```

## Parameters

### `--audit`

Outputs audit logs.

This is the default output for the command if not specified.

### `--error`

Outputs error logs.

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

### `--json`

{{< include "_includes/params/json.md" >}}

## Examples

Output audit logs.

```sh {.copy}
kes log
```

Output error logs in JSON format.

```sh {.copy}
kes log --error --json
```
