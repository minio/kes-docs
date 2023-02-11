---
title: KES API
date: 2023-02-08
draft: false
---

## API Overview

| [API](#Version)                                         |                                                             |
|:--------------------------------------------------------|:------------------------------------------------------------|
| [`/version`](#Version)                                  | Get version information.                                    |
| [`/v1/api`](#API)                                       | Get a list of supported API endpoints.                      |
| [`/v1/metrics`](#Metrics)                               | Get server metrics in the Prometheus exposition format.     |
| [`/v1/status`](#Status)                                 | Get server status information.                              |
| [**Key API**](#Key-API)                                 |                                                             |
| [`/v1/key/create`](#Create-Key)                         | Create a new cryptographic key.                             |
| [`/v1/key/import`](#Import-Key)                         | Import a cryptographic key.                                 |
| [`/v1/key/delete`](#Delete-Key)                         | Delete a cryptographic key.                                 |
| [`/v1/key/list`](#List-Keys)                            | List cryptographic keys.                                    |
| [`/v1/key/generate`](#Generate-Key)                     | Generate a new plain/encrypted data encryption key pair.    |
| [`/v1/key/encrypt`](#Encrypt-Key)                       | Encrypt a (small) plaintext with a key.                     |
| [`/v1/key/decrypt`](#Decrypt-Key)                       | Decrypt a (small) ciphertext with a key.                    |
| [`/v1/key/bulk/decrypt`](#Bulk-Decrypt-Key)             | Decrypt a list of (small) ciphertexts with a key.           |
| [**Policy API**](#Policy-API)                           |                                                             |
| [`/v1/policy/describe`](#Describe-Policy)               | Fetch information about a policy.                           |
| [`/v1/policy/assign`](#Assign-Policy)                   | Assign a policy to an identity.                             |
| [`/v1/policy/write`](#Write-Policy)                     | Create or overwrite a policy.                               |
| [`/v1/policy/read`](#Read-Policy)                       | Fetch a policy.                                             |
| [`/v1/policy/list`](#List-Policy)                       | List policies.                                              |
| [`/v1/policy/delete`](#List-Policy)                     | Delete a policy.                                            |
| [**Identity API**](#Identity-API)                       |                                                             |
| [`/v1/identity/describe`](#Describe-Identity)           | Fetch information about an identity.                        |
| [`/v1/identity/self/describe`](#Self-Describe-Identity) | Fetch information about the identity issuing the request.   |
| [`/v1/identity/delete`](#Delete-Identity)               | Delete an identity.                                         |
| [`/v1/identity/list`](#List-Identity)                   | List identities.                                            |
| [**Log API**](#Log-API)                                 |                                                             |
| [`/v1/log/audit`](#Audit-Log)                           | Subscribe to the audit log.                                 |
| [`/v1/log/error`](#Error-Log)                           | Subscribe to the error log.                                 |


### Version

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `GET`    | `/version`                  | `application/json` |

Get the KES server version information.

<details><summary>Response Type</summary>

```
{
    "version": string
}
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/version'
```

#### Sample Response
```json
{ 
  "version": "0.18.0"
}
```
</details>

### API

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `GET`    | `/v1/api`                   | `application/json` |

Get a list of API endpoints supported by the server.

<details><summary>Response Type</summary>

```
[
  {
    "method"  : string
    "path"    : string
    "max_body": number   // in bytes
    "timeout" : number   // in seconds, 0 indicates never times out
  }
]
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
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
    "method": "POST",
    "path": "/v1/key/create/",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "POST",
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
    "method": "POST",
    "path": "/v1/key/generate/",
    "max_body": 1048576,
    "timeout": 15
  },
  {
    "method": "POST",
    "path": "/v1/key/encrypt/",
    "max_body": 1048576,
    "timeout": 15
  },
  {
    "method": "POST",
    "path": "/v1/key/decrypt/",
    "max_body": 1048576,
    "timeout": 15
  },
  {
    "method": "POST",
    "path": "/v1/key/bulk/decrypt/",
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
    "method": "POST",
    "path": "/v1/policy/assign/",
    "max_body": 1048576,
    "timeout": 15
  },
  {
    "method": "GET",
    "path": "/v1/policy/read/",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "POST",
    "path": "/v1/policy/write/",
    "max_body": 1048576,
    "timeout": 15
  },
  {
    "method": "GET",
    "path": "/v1/policy/list/",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "DELETE",
    "path": "/v1/policy/delete/",
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
    "method": "DELETE",
    "path": "/v1/identity/forget/",
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
  {
    "method": "POST",
    "path": "/v1/enclave/create/",
    "max_body": 0,
    "timeout": 15
  },
  {
    "method": "POST",
    "path": "/v1/enclave/delete/",
    "max_body": 0,
    "timeout": 15
  }
]
```
</details>

### Metrics

| Method   | Path                     |
|:--------:|:------------------------:|
| `GET`    | `/v1/metrics`            |

Get server metrics. For example, the total number of requests.
The metrics are exposed in the [Prometheus exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/).

<details><summary>Response Type</summary>

```
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
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/metrics'
```

#### Sample Response
```
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
</details>

### Status

| Method   | Path                     | Content-Type       |
|:--------:|:------------------------:|:------------------:|
| `GET`    | `/v1/status`             | `application/json` |

Get the current status of the KES server. It returns 200 OK and a JSON document that describes
status-related server information, like its uptime, if the KES server is up and ready to serve
requests.

<details><summary>Response Type</summary>

```
{
    "version": string
    "uptime" : number       // in seconds
    "kms"    : {
        "state"  : string   // optional
        "latency": number   // optional, in milliseconds
    }
}
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/status'
```
#### Sample Response
```json
{
  "version": "0.17.1",
  "uptime": 3000000000,
  "kms": {
    "state": "reachable",
    "latency": 148000000
  }
}
```
</details>

***

## Key API

### Create Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `POST`   | `/v1/key/create/<name>`     | `application/json` |

Create a new cryptographic key.

</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request POST \
    'https://play.min.io:7373/v1/key/create/my-key'
```
</details>

### Import Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `POST`   | `/v1/key/import/<name>`     | `application/json` |

Import a cryptographic key into the KES server.

<details><summary>Request Type</summary>

```
{
   "bytes": string   // base64-encoded byte-string
}
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request POST \
    --data '{"bytes":"uNta318uv2GvEmMs5U4HiIWE/GtrpADR0cYZg+nhrkI="}' \
    'https://play.min.io:7373/v1/key/import/my-key'
```
</details>

### Delete Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `DELETE` | `/v1/key/delete/<name>`     | `application/json` |

Delete a new cryptographic key.

Please note that is a dangerous operations. Once a key has been deleted all
data that has been encrypted with it cannot be decrypted anymore, and therefore,
is lost.

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request DELETE \
    'https://play.min.io:7373/v1/key/delete/my-key'
```
</details>

### List Keys

| Method   | Path                        | Content-Type           |
|:--------:|:---------------------------:|:----------------------:|
| `GET`    | `/v1/key/list/<pattern>`    | `application/x-ndjson` |

List all key names that match the specified pattern.
In particular, the pattern `*` lists all keys.

<details><summary>Response Type</summary>

```
{
   "name"      : string
   "created_at": string    // optional, time (RFC 3339) with sub-second precision
   "created_by": string    // optional, KES identity
   "error"     : string    // optional
}
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/key/list/my-key*'
```

#### Sample Response
```json
{
  "name": "my-key"
}
{
  "name": "my-key1"
}
{
  "name": "my-key2"
}
```
</details>

### Generate Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `POST`   | `/v1/key/generate/<name>`   | `application/json` |

Generate a new data encryption key (DEK). The DEK is a plaintext-ciphertext pair.
The plaintext is randomly generated key that can be used for cryptographic operations.
For example, encrypting some data.
The ciphertext is the plaintext encrypted with the key (`<name>`) at the KES server.
Since this key never leaves the KES server, only the KES server can decrypt the
generated ciphertext.

An application should use the plaintext DEK for a cryptographic operation and should
remember the ciphertext DEK and which key (`<name>`) was used. 

<details><summary>Request Type</summary>

```
{
   "context": string    // optional, base64-encoded byte-string
}
```
</details>

<details><summary>Response Type</summary>

```
{
   "plaintext" : string    // base64-encoded byte-string
   "ciphertext": string    // base64-encoded byte-string
}
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request POST \
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
</details>

### Encrypt Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `POST`   | `/v1/key/encrypt/<name>`    | `application/json` |

Decrypts and authenticates a (small) plaintext with the cryptographic key.
The plaintext must not exceed 1 MB. The **Encrypt Key** endpoint is mainly
used for wrapping small data. For example another cryptographic key.

<details><summary>Request Type</summary>

```
{
   "plaintext": string    // base64-encoded byte string
   "context"  : string    // optional, base64-encoded byte-string
}
```
</details>

<details><summary>Response Type</summary>

```
{
   "ciphertext": string    // base64-encoded byte-string
}
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request POST \
    --data '{"plaintext":"SGVsbG8gV29ybGQhCg=="}' \
    'https://play.min.io:7373/v1/key/encrypt/my-key'
```

#### Sample Response
```json
{
  "ciphertext": "eyJhZWFkIjoiQUVTLTI1Ni1HQ00tSE1BQy1TSEEtMjU2IiwiaXYiOiIwUXJ0alUvWDJtUEtUK3A1R3JwdktRPT0iLCJub25jZSI6ImpxOGliYXVxKzY0dEZBM0kiLCJieXRlcyI6Im1MQ21hdzVxQW9acXpwOTJoMjZuRTJWR01BVkdCTTlJalNtT05SYz0ifQ=="
}
```
</details>

### Decrypt Key

| Method   | Path                        | Content-Type
|:--------:|:---------------------------:|:------------------:|
| `POST`   | `/v1/key/decrypt/<name>`    | `application/json` |

Decrypt a ciphertext with the cryptographic key. It returns the corresponding
plaintext if and only if the ciphertext is authentic and has been produced by the named key.

<details><summary>Request Type</summary>

```
{
   "ciphertext": string    // base64-encoded byte string
   "context"   : string    // optional, base64-encoded byte-string
}
```
</details>

<details><summary>Response Type</summary>

```
{
   "plaintext": string    // base64-encoded byte-string
}
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request POST \
    --data '{"ciphertext":"eyJhZWFkIjoiQUVTLTI1Ni1HQ00iLCJpdiI6ImJWbHRZVDdpUEtxUjNFYWpvaHp3cmc9PSIsIm5vbmNlIjoiSWxqaHBNcWViUUF5d1MxbyIsImJ5dGVzIjoiYlpNL1liU0E4ZSswVnFSUDhaR2UvdDJHQThrbzRBeXcwNGZBam1KWkIxKzk2OTg4VXYwcFJmRjEvS3poM1hGeCJ9"}' \
    'https://play.min.io:7373/v1/key/decrypt/my-key'
```

#### Sample Response
```json
{
  "plaintext": "TIDXCHZxPr84r7ktggCCW7otoz5T4zsRENi4THCjXPo="
}
```
</details>

### Bulk Decrypt Key

| Method   | Path                             | Content-Type
|:--------:|:--------------------------------:|:------------------:|
| `POST`   | `/v1/key/bulk/decrypt/<name>`    | `application/json` |

Decrypt a list of ciphertexts with the cryptographic key. It returns the corresponding
plaintexts if and only if all ciphertexts are authentic and has been produced by the named key.

<details><summary>Request Type</summary>

```
[
  {
     "ciphertext": string    // base64-encoded byte string
     "context"   : string    // optional, base64-encoded byte-string
  }
]
```
</details>

<details><summary>Response Type</summary>

```
[
  {
    "plaintext": string    // base64-encoded byte-string
  }
]
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request POST \
    --data '[{"ciphertext":"eyJhZWFkIjoiQUVTLTI1Ni1HQ00iLCJpdiI6ImJWbHRZVDdpUEtxUjNFYWpvaHp3cmc9PSIsIm5vbmNlIjoiSWxqaHBNcWViUUF5d1MxbyIsImJ5dGVzIjoiYlpNL1liU0E4ZSswVnFSUDhaR2UvdDJHQThrbzRBeXcwNGZBam1KWkIxKzk2OTg4VXYwcFJmRjEvS3poM1hGeCJ9"},{"ciphertext":"eyJhZWFkIjoiQUVTLTI1Ni1HQ00tSE1BQy1TSEEtMjU2IiwiaWQiOiIxYTQ3ZjY4ZjE0MWNlNGJmZDIwOWFmZThlNzViMzI4MSIsIml2IjoiZHkxZGdaV2FUVTN1WThGdHE2QjI2UT09Iiwibm9uY2UiOiJldllDMWdoT1NtSEllbFdRIiwiYnl0ZXMiOiJkQUJBOFdISldPOVZEWXdRRFQ3TTl1NDRESjdVRVVVcVE0UzBOYXpuQ3dDd2U2MHl3R2o5TUxLaUUzMDE3R0psIn0="}]' \
    'https://play.min.io:7373/v1/key/decrypt/my-key'
```

#### Sample Response
```json
[
  {
    "plaintext": "TIDXCHZxPr84r7ktggCCW7otoz5T4zsRENi4THCjXPo="
  },
  {
    "plaintext": "F5YcdDIZgZSYRrLB0gsCWDK7RP/Vc+25Mh+rRhWxbvo="
  }
]
```
</details>

***

## Policy API

### Describe Policy

| Method   | Path                            | Content-Type       |
|:--------:|:-------------------------------:|:------------------:|
| `GET`    | `/v1/policy/describe/<policy>`  | `application/json` |

Describes a policy by returning its metadata - e.g. who created the
policy at which point in time.

<details><summary>Response Type</summary>

```
{
   "created_at": string    // RFC 3339 encoded timestamp
   "created_by": string    // KES identity
}
```

</details>


<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/identity/describe/my-policy'
```

#### Sample Response
```json
{
   "created_at": "2020-03-24T12:37:33Z",
   "created_by": "2ed3c8c81376106d14a3374e901aa1ec59a978db3133c9619ba526ce6754d2e6"
}
```

</details>

### Assign Policy

| Method   | Path                            | Content-Type       |
|:--------:|:-------------------------------:|:------------------:|
| `POST`   | `/v1/policy/assign/<policy>`    | `application/json` |

Assign a policy to an identity. An identity can have at most one policy
while the same policy can be assigned to multiple identities.

The assigned policy defines which API calls this identity can perform.
It's not possible to assign a policy to the admin identity. Further,
an identity cannot assign a policy to itself.

<details><summary>Request Type</summary>

```
{
   "identity": string    // KES identity
}
```
</details>


<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request POST \
    --data '{"identity":"a4eac2d875d60ef25b068965c4e850aac074028dc576f3699276c6ea0ae1828f"}' \
    'https://play.min.io:7373/v1/identity/assign/my-policy'
```

</details>

### Write Policy

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `POST`   | `/v1/policy/write/<policy>` | `application/json` |

Create or update a policy at the KES server.

<details><summary>Request Type</summary>

```
{
   "allow": [string]   // optional
   "deny" : [string]   // optional
}
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request POST \
    --data '{"allow":["/v1/key/generate/my-key","/v1/key/decrypt/my-key"]}' \
    'https://play.min.io:7373/v1/policy/write/my-policy'
```
</details>

### Read Policy

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `GET`    | `/v1/policy/read/<policy>`  | `application/json` |

Get a policy from the KES server.

<details><summary>Response Type</summary>

```
{
   "allow": [string]   // optional
   "deny" : [string]   // optional
}
```
</details>


<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/policy/read/my-policy'
```

### Sample Response
```json
{
  "allow": [
    "/v1/key/generate/my-key",
    "/v1/key/decrypt/my-key"
  ]
}
```
</details>

### List Policy

| Method   | Path                        | Content-Type           |
|:--------:|:---------------------------:|:----------------------:|
| `GET`    | `/v1/policy/list/<pattern>` | `application/x-ndjson` |

List all policy metadata that match the specified pattern.
In particular, the pattern `*` lists all policy metadata.

<details><summary>Response Type</summary>

```
{
   "name"      : string
   "created_at": string    // optional, time (RFC 3339) with sub-second precision
   "created_by": string    // optional, KES identity
   "error"     : string    // optional
}
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/policy/list/*'
```

### Sample Response
```json
{
  "name": "my-policy",
  "created_at": "2022-03-02T12:11:06.840267Z",
  "created_by": "3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22"
}
{
  "name": "my-policy2",
  "created_at": "2022-03-02T12:12:10.181179Z",
  "created_by": "3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22"
}
```
</details>

### Delete Policy

| Method   | Path                         | Content-Type       |
|:--------:|:----------------------------:|:------------------:|
| `DELETE` | `/v1/policy/delete/<policy>` | `application/json` |

Delete a policy from KES server.

All identities that have been assigned to this policy will lose all authorization privileges.  

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request DELETE \
    'https://play.min.io:7373/v1/policy/delete/my-policy'
```
</details>

***

## Identity API

### Describe Identity

| Method   | Path                               | Content-Type       |
|:--------:|:----------------------------------:|:------------------:|
| `GET`    | `/v1/identity/describe/<identity>` | `application/json` |

Describes an identity by returning its metadata - e.g. which policy
is currently assigned and whether its an admin identity.

<details><summary>Response Type</summary>

```
{
   "policy"    : string    // Name of assigned policy. Empty if admin is true
   "admin"     : boolean   // True if the identity is an admin
   "created_at": string    // RFC 3339 encoded timestamp
   "created_by": string    // KES identity
}
```

</details>

<details><summary>Example</summary>

#### Sample Request
```bash
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

</details>

### Self Describe Identity

| Method   | Path                         | Content-Type       |
|:--------:|:----------------------------:|:------------------:|
| `GET`    | `/v1/identity/self/describe` | `application/json` |

Describes the identity issuing the request. It infers the identity from
the TLS client certificate used to authenticate. It returns the identity
and policy information for the client identity.

The self-describe API endpoint is publicly available and does not
require any special permissions. Any client can query its own identity
and policy information.

<details><summary>Response Type</summary>

```
{
   "identity"   : string    // KES identity issuing the request
   "policy_name": string    // Name of assigned policy. Empty if admin is true
   "admin"      : boolean   // True if the identity is an admin
   "created_at" : string    // RFC 3339 encoded timestamp
   "created_by" : string    // KES identity
   "policy"     : {
      "allow": [string]     // optional
      "deny" : [string]     // optional
   }
}
```

</details>

<details><summary>Example</summary>

#### Sample Request
```bash
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

</details>

### Delete Identity

| Method   | Path                             | Content-Type       |
|:--------:|:--------------------------------:|:------------------:|
| `DELETE` | `/v1/identity/delete/<identity>` | `application/json` |

Deletes an identity from the KES server.

The client certificate that corresponds to the identity
is no longer authorized to perform any API operations.
The admin identity cannot be deleted.

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request DELETE \
    'https://play.min.io:7373/v1/identity/delete/a4eac2d875d60ef25b068965c4e850aac074028dc576f3699276c6ea0ae1828f'
```
</details>

### List Identity

| Method   | Path                          | Content-Type           |
|:--------:|:-----------------------------:|:----------------------:|
| `GET`    | `/v1/identity/list/<pattern>` | `application/x-ndjson` |

List all identity metadata hat match the specified pattern.
In particular, the pattern `*` lists all identity metadata.

<details><summary>Response Type</summary>

```
{
   "identity"  : string    // KES identity
   "policy"    : string
   "created_at": string    // optional, time (RFC 3339) with sub-second precision
   "created_by": string    // optional, KES identity
   "error"     : string    // optional
}
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/identity/list/*'
```

#### Sample Response
```json
{
  "identity": "413c35cb06a9e1aa142ccebf829c96cbfd16162131a92f5ec8c9006f6fc5c9dc",
  "policy": "my-policy",
  "created_at": "2022-03-02T12:25:36.938167Z",
}
{
  "identity": "1d7562ffd775ed4da949e4b08fe1085fba4991cadba4a96142a578c30106ba23",
  "policy": "my-policy2",
  "created_at": "2022-03-02T12:27:47.554596Z",
}
```
</details>

***

## Log API

### Audit Log

| Method   | Path                         | Content-Type           |
|:--------:|:----------------------------:|:----------------------:|
| `GET`    | `/v1/log/audit`              | `application/x-ndjson` |

Connect to the KES server audit log such that all new audit events are streamed to the client.

<details><summary>Response Type</summary>

```
{
    "time"    : string
    "request" : {
        "path"    : string
        "identity": string   // optional, KES identity
        "ip"      : string   // optional, IPv4 or IPv6 address
    }
    "response": {
        "code": number
        "time": string
    }
}
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request GET \
    'https://play.min.io:7373/v1/log/audit'
```

#### Sample Response
```json
{"time":"2020-02-06T16:51:55Z","request":{"path":"/v1/log/audit/trace","identity":"dd46485bedc9ad2909d2e8f9017216eec4413bc5c64b236d992f7ec19c843c5f"},"response":{"code":200, "time":12056}}
{"time":"2020-02-06T16:52:18Z","request":{"path":"/v1/policy/list/*","identity":"dd46485bedc9ad2909d2e8f9017216eec4413bc5c64b236d992f7ec19c843c5f"},"response":{"code":200, "time":28088}}
{"time":"2020-02-06T16:52:25Z","request":{"path":"/v1/identity/list/*","identity":"dd46485bedc9ad2909d2e8f9017216eec4413bc5c64b236d992f7ec19c843c5f"},"response":{"code":200, "time":16476}}
```
</details>

### Error Log

| Method   | Path                         | Content-Type           |
|:--------:|:----------------------------:|:----------------------:|
| `GET`    | `/v1/log/error`              | `application/x-ndjson` |


Connect to the KES server error log such that all new error events are streamed to the client.

<details><summary>Response Type</summary>

```
{
    "message": string
}
```
</details>

<details><summary>Example</summary>

#### Sample Request
```bash
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