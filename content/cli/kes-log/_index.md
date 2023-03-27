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
    [--json]         \
    [--insecure, -k]
```

## Parameters

### `--audit`

Outputs audit logs.

This is the default output for the command if not specified.

### `--error`

Outputs error logs.

### `--json`

Output log events in JSON format.

### `--insecure, -k`

_Optional_

Use this during testing and in non-production environments to bypass the TLS validation.

## Examples

Output audit logs.

```sh {.copy}
kes log
```

Output error logs in JSON format.

```sh {.copy}
kes log --error --json
```
