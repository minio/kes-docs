---
title: kes metric
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Output server metrics.

The output resembles the following:

```sh
Request    OK [2xx]       Err [4xx]       Err [5xx]      Req/s        Latency
               9231           14603               0       0.00           13ms
             38.73%          61.27%           0.00%

System       UpTime            Heap           Stack       CPUs        Threads
          142h40m3s           3.1MB           1.0MB          4             19
```

## Syntax

```sh
kes metric           \
    [--insecure, -k] \
    [--rate]
```
## Parameters

### `--insecure, -k`

{{< include "_includes/params/insecure.md" >}}

### `--rate`

The frequency to scrape metrics for output.
Use time in seconds, such as `300s`.

If not specified, the default is `5s`.

## Examples

Output metrics at the default scrape rate of every 5 seconds.

```sh {.copy}
kes metric
```

Scrape and output metrics every 10 minutes, or 600 seconds.

```sh {.copy}
kes metric --rate 600s
```