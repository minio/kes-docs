---
title: Logging
date: 2023-02-08
draft: false
---

In general, the KES server produces two different kinds of logs.

### Error Log

The KES server writes an error log event whenever it encounters an unexpected error.
For example, when it detects corrupted backend data.
```
2022/02/18 17:19:47 http: failed to reload certificate "/etc/kes/public.crt": permission denied
```
> The only exception is the [metrics API](https://github.com/minio/kes/wiki/Server-API#Metrics) endpoint. Otherwise, querying
> the KES server metrics would change the metrics. This behavior would be quite irritating.

### Audit Log

In addition to error logs, a KES server also produces an audit log stream. The audit log contains one log entry for each
server API operation.
```json
{"time":"2020-03-24T12:37:33Z","request":{"path":"/v1/key/create/my-key","identity":"dd46485bedc9ad2909d2e8f9017216eec4413bc5c64b236d992f7ec19c843c5f"},"response":{"code":200, "time":12106}}
```
> The only exception is the [metrics API](https://github.com/minio/kes/wiki/Server-API#Metrics) endpoint. Otherwise, querying
> the KES server metrics would change the metrics. This behavior would be quite irritating.

***

The KES server can write error log events to `STDERR` and audit log events to `STDOUT`.
By default, the KES server writes error events to `STDERR` and does not write audit events to `STDOUT`.
This behavior can be changed in the KES server [configuration file](https://github.com/minio/kes/blob/master/server-config.yaml#L120).

The KES CLI can subscribe to the server log API and pretty-print the log events:

Further, KES exposes error and audit logs as part of its [API](https://github.com/minio/kes/wiki/Server-API#Log-API).
KES clients can connect to the error resp. audit log stream and obtain new log events remotely via the `kes log` command.

![](https://raw.githubusercontent.com/wiki/minio/kes/images/KES-audit-log.png)

### References

 - [**Server API Doc**](https://github.com/minio/kes/wiki/Server-API)
 - [**Go SDK Doc**](https://pkg.go.dev/github.com/minio/kes)