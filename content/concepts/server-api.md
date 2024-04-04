---
title: KES API
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---

## API Overview

By default, KES requires a valid certificate for any API call.
Requests without a certificate fail with a TLS error.

You can disable the requirement for a valid certificate when calling some endpoints in the KES [configuration file]({{< relref "tutorials/configuration.md#api-configuration" >}}).

If any endpoint does not require a certificate, failed calls result in an HTTP error instead of a TLS error.


| [**API**](#Version)                                     |                                                             |
|:--------------------------------------------------------|:------------------------------------------------------------|
| [`/version`](#version)                                  | Get version information.                                    |
| [`/ready`](#ready)                                      | Return KES server readiness.                                |
| [`/v1/api`](#api)                                       | Get a list of supported API endpoints.                      |
| [`/v1/metrics`](#metrics)                               | Get server metrics in the Prometheus exposition format.     |
| [`/v1/status`](#status)                                 | Get server status information.                              |
| [**Key API**](#key-api)                                 |                                                             |
| [`/v1/key/create`](#create-key)                         | Create a new cryptographic key.                             |
| [`/v1/key/import`](#import-key)                         | Import a cryptographic key.                                 |
| [`/v1/key/delete`](#delete-key)                         | Delete a cryptographic key.                                 |
| [`/v1/key/list`](#list-keys)                            | List cryptographic keys.                                    |
| [`/v1/key/generate`](#generate-key)                     | Generate a new plain/encrypted data encryption key pair.    |
| [`/v1/key/encrypt`](#encrypt-key)                       | Encrypt a (small) plaintext with a key.                     |
| [`/v1/key/decrypt`](#decrypt-key)                       | Decrypt a (small) ciphertext with a key.                    |
| [`/v1/key/hmac`](#hmac)                                 | 
| [**Policy API**](#Policy-API)                           |                                                             |
| [`/v1/policy/describe`](#describe-policy)               | Fetch information about a policy.                           |
| [`/v1/policy/read`](#read-policy)                       | Fetch a policy.                                             |
| [`/v1/policy/list`](#list-policy)                       | List policies.                                              |
| [**Identity API**](#identity-api)                       |                                                             |
| [`/v1/identity/describe`](#describe-odentity)           | Fetch information about an identity.                        |
| [`/v1/identity/self/describe`](#self-describe-identity) | Fetch information about the identity issuing the request.   |
| [`/v1/identity/list`](#list-identity)                   | List identities.                                            |
| [**Log API**](#log-api)                                 |                                                             |
| [`/v1/log/audit`](#audit-log)                           | Subscribe to the audit log.                                 |
| [`/v1/log/error`](#error-log)                           | Subscribe to the error log.                                 |


### Version

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `GET`    | `/version`                  | `application/json` |

Get the KES server version information.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/version'
```

#### Sample Response
```json
{
  "version": "2023-10-03T00-48-37Z",
  "commit": "9d1b5ad6dbdd963beabfbc91eb1ca0d330d5cd3d"
}
```

### Ready

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `GET`    | `/v1/ready`                 | `application/json` |

The KES server readiness probe. 
Returns `200 OK` if KES is ready.

You can disable the requirement for a valid certificate when calling this endpoint in the KES [configuration file]({{< relref "tutorials/configuration.md#api-configuration" >}}).

#### Sample Request
```bash {.copy}
$ curl \
    -I \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/ready'
```

#### Sample Response
```
HTTP/1.1 200 OK
Date: Sat, 28 Oct 2023 16:29:49 GMT
Content-Length: 0
```

### API

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `GET`    | `/v1/api`                   | `application/json` |

Get a list of API endpoints supported by the server.

You can disable the requirement for a valid certificate when calling this endpoint in the KES [configuration file]({{< relref "tutorials/configuration.md#api-configuration" >}}).

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/api'
```

#### Sample Response
```json
[
  {
    "method": "GET",
    "path": "/version",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "GET",
    "path": "/v1/status",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "GET",
    "path": "/v1/metrics",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "GET",
    "path": "/v1/api",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "PUT",
    "path": "/v1/key/create/",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "PUT",
    "path": "/v1/key/import/",
    "max_body": 1048576,
    "timeout": 15
  },
  {
    "method": "DELETE",
    "path": "/v1/key/delete/",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "PUT",
    "path": "/v1/key/generate/",
    "max_body": 1048576,
    "timeout": 15
  },
  {
    "method": "PUT",
    "path": "/v1/key/encrypt/",
    "max_body": 1048576,
    "timeout": 15
  },
  {
    "method": "PUT",
    "path": "/v1/key/decrypt/",
    "max_body": 1048576,
    "timeout": 15
  },
  {
    "method": "GET",
    "path": "/v1/key/list/",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "GET",
    "path": "/v1/policy/describe/",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "GET",
    "path": "/v1/policy/read/",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "GET",
    "path": "/v1/policy/list/",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "GET",
    "path": "/v1/identity/describe/",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "GET",
    "path": "/v1/identity/self/describe",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "GET",
    "path": "/v1/identity/list/",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "GET",
    "path": "/v1/log/error",
    "max_body": 0,
    "timeout": 0
  },
  {
    "method": "GET",
    "path": "/v1/log/audit",
    "max_body": 0,
    "timeout": 0
  },
]
```

### Metrics

| Method   | Path                     |
|:--------:|:------------------------:|
| `GET`    | `/v1/metrics`            |

Get server metrics. 

For example, the total number of requests.
Metrics return in the [Prometheus exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/).

You can disable the requirement for a valid certificate when calling this endpoint in the KES [configuration file]({{< relref "tutorials/configuration.md#api-configuration" >}}).

```sh
# TYPE kes_http_request_active gauge
kes_http_request_active 0

# TYPE kes_http_request_error counter
kes_http_request_error 0

# TYPE kes_http_request_failure counter
kes_http_request_failure 0

# TYPE kes_http_request_success counter
kes_http_request_success 0

# TYPE kes_http_response_time histogram
kes_http_response_time_bucket{le="0.01"} 0
kes_http_response_time_bucket{le="0.05"} 0
kes_http_response_time_bucket{le="0.1"} 0
kes_http_response_time_bucket{le="0.25"} 0
kes_http_response_time_bucket{le="0.5"} 0
kes_http_response_time_bucket{le="1"} 0
kes_http_response_time_bucket{le="1.5"} 0
kes_http_response_time_bucket{le="3"} 0
kes_http_response_time_bucket{le="5"} 0
kes_http_response_time_bucket{le="10"} 0
kes_http_response_time_bucket{le="+Inf"} 0
kes_http_response_time_sum 0
kes_http_response_time_count 0

# TYPE kes_log_audit_events counter
kes_log_audit_events 0

# TYPE kes_log_error_events counter
kes_log_error_events 0

# TYPE kes_system_up_time gauge
kes_system_up_time 0
```

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/metrics'
```

#### Sample Response

```bash
# HELP kes_http_request_active Number of active requests that are not finished, yet.
# TYPE kes_http_request_active gauge
kes_http_request_active 0
# HELP kes_http_request_error Number of request that failed due to some error. (HTTP 4xx status code)
# TYPE kes_http_request_error counter
kes_http_request_error 22462
# HELP kes_http_request_failure Number of request that failed due to some internal failure. (HTTP 5xx status code)
# TYPE kes_http_request_failure counter
kes_http_request_failure 0
# HELP kes_http_request_success Number of requests that have been served successfully.
# TYPE kes_http_request_success counter
kes_http_request_success 2.277925e+06
# HELP kes_http_response_time Histogram of request response times spawning from 10ms to 10s.
# TYPE kes_http_response_time histogram
kes_http_response_time_bucket{le="0.01"} 2.279745e+06
kes_http_response_time_bucket{le="0.05"} 2.291429e+06
kes_http_response_time_bucket{le="0.1"} 2.29555e+06
kes_http_response_time_bucket{le="0.25"} 2.299088e+06
kes_http_response_time_bucket{le="0.5"} 2.299715e+06
kes_http_response_time_bucket{le="1"} 2.300182e+06
kes_http_response_time_bucket{le="1.5"} 2.300256e+06
kes_http_response_time_bucket{le="3"} 2.300329e+06
kes_http_response_time_bucket{le="5"} 2.300364e+06
kes_http_response_time_bucket{le="10"} 2.300383e+06
kes_http_response_time_bucket{le="+Inf"} 2.300387e+06
kes_http_response_time_sum 3503.8908393496145
kes_http_response_time_count 2.300387e+06
# HELP kes_log_audit_events Number of audit log events written to the audit log targets.
# TYPE kes_log_audit_events counter
kes_log_audit_events 2.300387e+06
# HELP kes_log_error_events Number of error log events written to the error log targets.
# TYPE kes_log_error_events counter
kes_log_error_events 59
# HELP kes_system_up_time The time the server has been up and running in seconds.
# TYPE kes_system_up_time gauge
kes_system_up_time 837876.75
```

### Status

| Method   | Path                     | Content-Type       |
|:--------:|:------------------------:|:------------------:|
| `GET`    | `/v1/status`             | `application/json` |

Get the current status of the KES server. 
If the server is up, the request returns `200 OK` and a JSON document that describes status-related server information.
The information the response returns includes the following:

- Version
- Uptime (in seconds)
- OS and CPU architecture
- Current memory consumption
- Keystore status
- Keystore latency (in ms)

You can disable the requirement for a valid certificate when calling this endpoint in the KES [configuration file]({{< relref "tutorials/configuration.md#api-configuration" >}}).

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/status'
```
#### Sample Response
```json
{
  "version": "2023-10-03T00-48-37Z",
  "os": "linux",
  "arch": "amd64",
  "uptime": 724306, // in seconds
  "num_cpu": 4,
  "num_cpu_used": 4,
  "mem_heap_used": 4960704,
  "mem_stack_used": 1081344,
  "keystore_latency": 1 // in milliseconds
}
```

## Key API

### Create Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `PUT`    | `/v1/key/create/<name>`     | `application/json` |

Create a new cryptographic key.


#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request PUT \
    'https://play.min.io:7373/v1/key/create/my-key'
```

### Import Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `PUT`    | `/v1/key/import/<name>`     | `application/json` |

Import a cryptographic key into the KES server.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request PUT \
    --data '{"bytes":"uNta318uv2GvEmMs5U4HiIWE/GtrpADR0cYZg+nhrkI="}' \
    'https://play.min.io:7373/v1/key/import/my-key'
```

### Delete Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `DELETE` | `/v1/key/delete/<name>`     | `application/json` |

Delete a new cryptographic key.

**Warning:** This is a dangerous operation. 
You cannot decrypt any data encrypted by a key after deleting the key.
This operation may cause data loss.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request DELETE \
    'https://play.min.io:7373/v1/key/delete/my-key'
```

### List Keys

| Method   | Path                        | Content-Type      |
|:--------:|:---------------------------:|:-----------------:|
| `GET`    | `/v1/key/list/<prefix>`    | `application/json` |

List all key names. Specify an optional prefix to list only key names starting with that prefix.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/key/list/my-key'
```

#### Sample Response
```json
{
  "names": [ "key-0", "key-1", "key-2" ],
  "continue_at": "key-3" 
}
```

### Generate Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `PUT`    | `/v1/key/generate/<name>`   | `application/json` |

Generate a new data encryption key (DEK). 

The DEK is a *plaintext-ciphertext* pair.
The *plaintext* is a randomly generated key that can be used for cryptographic operations, such as encrypting data.
The *ciphertext* is the plaintext encrypted with the key `<name>` at the KES server.
Since this key never leaves the KES server, only the KES server can decrypt the generated *ciphertext*.

An application should use the plaintext DEK for a cryptographic operation.
The application should remember both the ciphertext DEK and which key `<name>` was used. 

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request PUT \
    --data '{}' \
    'https://play.min.io:7373/v1/key/generate/my-key'
```

#### Sample Response
```json
{
  "plaintext": "TIDXCHZxPr84r7ktggCCW7otoz5T4zsRENi4THCjXPo=",
  "ciphertext": "eyJhZWFkIjoiQUVTLTI1Ni1HQ00iLCJpdiI6ImJWbHRZVDdpUEtxUjNFYWpvaHp3cmc9PSIsIm5vbmNlIjoiSWxqaHBNcWViUUF5d1MxbyIsImJ5dGVzIjoiYlpNL1liU0E4ZSswVnFSUDhaR2UvdDJHQThrbzRBeXcwNGZBam1KWkIxKzk2OTg4VXYwcFJmRjEvS3poM1hGeCJ9"
}
```

### Encrypt Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `PUT`    | `/v1/key/encrypt/<name>`    | `application/json` |

Decrypts and authenticates a small plaintext with the cryptographic key.
The plaintext must not exceed 1 MB. 
Use the **Encrypt Key** endpoint for wrapping small data, such as another cryptographic key. 

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request PUT \
    --data '{"plaintext":"SGVsbG8gV29ybGQhCg=="}' \
    'https://play.min.io:7373/v1/key/encrypt/my-key'
```

#### Sample Response
```json {.copy}
{
  "ciphertext": "eyJhZWFkIjoiQUVTLTI1Ni1HQ00tSE1BQy1TSEEtMjU2IiwiaXYiOiIwUXJ0alUvWDJtUEtUK3A1R3JwdktRPT0iLCJub25jZSI6ImpxOGliYXVxKzY0dEZBM0kiLCJieXRlcyI6Im1MQ21hdzVxQW9acXpwOTJoMjZuRTJWR01BVkdCTTlJalNtT05SYz0ifQ=="
}
```

### Decrypt Key

| Method   | Path                        | Content-Type
|:--------:|:---------------------------:|:------------------:|
| `PUT`    | `/v1/key/decrypt/<name>`    | `application/json` |

Decrypts a ciphertext with the cryptographic key. 
Returns the corresponding plaintext if and only if the ciphertext is authentic and has been produced by the named key.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request PUT \
    --data '{"ciphertext":"eyJhZWFkIjoiQUVTLTI1Ni1HQ00iLCJpdiI6ImJWbHRZVDdpUEtxUjNFYWpvaHp3cmc9PSIsIm5vbmNlIjoiSWxqaHBNcWViUUF5d1MxbyIsImJ5dGVzIjoiYlpNL1liU0E4ZSswVnFSUDhaR2UvdDJHQThrbzRBeXcwNGZBam1KWkIxKzk2OTg4VXYwcFJmRjEvS3poM1hGeCJ9"}' \
    'https://play.min.io:7373/v1/key/decrypt/my-key'
```

#### Sample Response
```json
{
  "plaintext": "TIDXCHZxPr84r7ktggCCW7otoz5T4zsRENi4THCjXPo="
}
```

### HMAC


| Method   | Path                  | Content-Type       |
|:--------:|:---------------------:|:------------------:|
| `PUT`    | `/v1/key/hmac/`       | `application/json` |

Compute a message authentication code (MAC) for the data passed in the request. 
Use this to verify that messages are authentic or to generate the same pseudo-random secret on startup.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request PUT \
    --data '{"message":"Data to use to generate the HMAC secret"}'
```

#### Sample Response
```json
{
  "hmac": "5ded46b0e5450b0790637d71e453bce1fdae61f25a34c211216906a99791c6a5"
}
```

## Policy API

### Describe Policy

| Method   | Path                            | Content-Type       |
|:--------:|:-------------------------------:|:------------------:|
| `GET`    | `/v1/policy/describe/<policy>`  | `application/json` |

Describes a policy by returning its metadata.
For example, retrieves who created the policy and when did they create it.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/identity/describe/my-policy'
```

#### Sample Response
```json
{
   "name": "my-policy",
   "created_at": "2020-03-24T12:37:33Z",
   "created_by": "2ed3c8c81376106d14a3374e901aa1ec59a978db3133c9619ba526ce6754d2e6"
}
```

### Read Policy

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `GET`    | `/v1/policy/read/<policy>`  | `application/json` |

Get a policy from the KES server.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/policy/read/my-policy'
```

### Sample Response
```json
{
  "allow": {
    "/v1/key/generate/my-key": {},
    "/v1/key/decrypt/my-key": {}
  },
  "deny": {    
    "/v1/key/decrypt/my-key-internal*": {}
  }
}
```

### List Policy

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `GET`    | `/v1/policy/list/<prefix>`  | `application/json` |

List all policy names. Specify an optional prefix to list only policy names starting with that prefix.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/policy/list/my-policy'
```

### Sample Response
```json
{
  "names": ["my-policy", "my-policy-2"],
  "continue_at": ""
}
```

## Identity API

### Describe Identity

| Method   | Path                               | Content-Type       |
|:--------:|:----------------------------------:|:------------------:|
| `GET`    | `/v1/identity/describe/<identity>` | `application/json` |

Describes an identity by returning its metadata.
For example, use this endpoint to determine the currently assigned policy or whether it is an admin identity.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/identity/describe/650a2580943a87172933b7a8d26fa1dfdd0447762f26397f30c1b8bf8c78b913'
```

#### Sample Response
```json
{
   "policy": "minio",
   "admin": false,
   "created_at": "2020-03-24T12:37:33Z",
   "created_by": "2ed3c8c81376106d14a3374e901aa1ec59a978db3133c9619ba526ce6754d2e6"
}
```

### Self Describe Identity

| Method   | Path                         | Content-Type       |
|:--------:|:----------------------------:|:------------------:|
| `GET`    | `/v1/identity/self/describe` | `application/json` |

Describes the identity issuing the request. 
It infers the identity from the TLS client certificate used to authenticate. 
It returns the identity and policy information for the client identity.

The self-describe API endpoint is publicly available and does not require any special permissions. 
Any client can query its own identity and policy information.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/identity/self/describe'
```

#### Sample Response
```json
{
  "identity": "3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22",
  "admin": true,
  "created_at": "2022-03-28T13:02:32.837365Z",
  "policy": {
    "Allow": null,
    "Deny": null
  }
}
```

### List Identity

| Method   | Path                          | Content-Type       |
|:--------:|:-----------------------------:|:------------------:|
| `GET`    | `/v1/identity/list/<prefix>`  | `application/json` |

List all identities. Specify an optional prefix to list only identities starting with that prefix.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/identity/list/'
```

#### Sample Response
```json
{
  "identities": [ 
    "413c35cb06a9e1aa142ccebf829c96cbfd16162131a92f5ec8c9006f6fc5c9dc",
    "1d7562ffd775ed4da949e4b08fe1085fba4991cadba4a96142a578c30106ba23"
  ],
  "continue_at": ""
}
```

## Log API

### Audit Log

| Method   | Path                         | Content-Type           |
|:--------:|:----------------------------:|:----------------------:|
| `GET`    | `/v1/log/audit`              | `application/x-ndjson` |

Connect to the KES server audit log such that all new audit events stream to the client.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/log/audit'
```

#### Sample Response
```json
{"time":"2020-02-06T16:51:55Z","request":{"path":"/v1/log/audit/trace","identity":"dd46485bedc9ad2909d2e8f9017216eec4413bc5c64b236d992f7ec19c843c5f"},"response":{"code":200, "time":1200}}
{"time":"2020-02-06T16:52:18Z","request":{"path":"/v1/policy/list/*","identity":"dd46485bedc9ad2909d2e8f9017216eec4413bc5c64b236d992f7ec19c843c5f"},"response":{"code":200, "time":2800}}
{"time":"2020-02-06T16:52:25Z","request":{"path":"/v1/identity/list/*","identity":"dd46485bedc9ad2909d2e8f9017216eec4413bc5c64b236d992f7ec19c843c5f"},"response":{"code":200, "time":1640}}
```

### Error Log

| Method   | Path                         | Content-Type           |
|:--------:|:----------------------------:|:----------------------:|
| `GET`    | `/v1/log/error`              | `application/x-ndjson` |


Connect to the KES server error log such that all new error events stream to the client.

#### Sample Request
```bash {.copy}
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/log/error/'
```

#### Sample Response
```json
{"message":"2020/03/24 14:46:10 aws: secret was not encrypted with '4f9147d9-a676-47cd-ad3f-3485abf9123d'"}
{"message":"2020/03/24 14:46:17 aws: the CMK 'ff8e2c25-b259-4f74-a001-c7b62d17e0a4' does not exist"}
{"message":"2020/03/24 14:46:25 aws: the CMK '8fc17745-9647-4797-b170-afd8b52ed7c0' cannot be used for decryption"}
```
</details>
