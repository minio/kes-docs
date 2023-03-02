---
title: Logging
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---

The KES server produces two different kinds of logs.

- Error logs
- Audit logs

## Error Logs

The KES server writes an error log event whenever it encounters an unexpected error.
For example, when it detects corrupted backend data.

```
2022/02/18 17:19:47 http: failed to reload certificate "/etc/kes/public.crt": permission denied
```

The only exception is unexpected errors at the the [metrics API]({{< relref "server-api.md#metrics">}}) endpoint. 
Otherwise, querying the KES server metrics would change the metrics. 

## Audit Logs

The KES server also produces an audit log stream. 
The audit log contains one log entry for each server API operation.

```json
{"time":"2020-03-24T12:37:33Z","request":{"path":"/v1/key/create/my-key","identity":"dd46485bedc9ad2909d2e8f9017216eec4413bc5c64b236d992f7ec19c843c5f"},"response":{"code":200, "time":12106}}
```

{{< admonition type="caution">}}
The KES server does **not** record audit logs for operations on the [metrics API]({{< relref "server-api.md#metrics">}}) endpoint. 
Otherwise, querying the KES server metrics would change the metrics.
{{< /admonition >}}

## Configuration Options

The KES server can write error log events to `STDERR` and audit log events to `STDOUT`.

By default, the KES server writes error events to `STDERR` but does _not_ write audit events to `STDOUT`.
This behavior can be changed in the KES server [configuration file]({{< relref "/tutorials/configuration.md#logging-configuration" >}}).

The KES CLI can subscribe to the server log API and pretty-print the log events:

![](https://raw.githubusercontent.com/wiki/minio/kes/images/KES-audit-log.png)

## Logs by API

KES exposes error and audit logs as part of its [API]({{< relref "Server-API#log-api" >}}).
KES clients can connect to the error or audit log stream and obtain new log events remotely via the `kes log` command.


## References

 - [Server API Doc]({{< relref "server-api.md" >}})
 - [Go SDK Doc](https://pkg.go.dev/github.com/minio/kes)