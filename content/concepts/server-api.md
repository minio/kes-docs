---
title: KES API
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---

## API Overview

| [**API**](#Version)                                     |                                                             |
|:--------------------------------------------------------|:------------------------------------------------------------|
| [`/version`](#version)                                  | Get version information.                                    |
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
| [`/v1/key/decrypt`](#decrypt-ley)                       | Decrypt a (small) ciphertext with a key.                    |
| [`/v1/key/bulk/decrypt`](#bulk-decrypt-key)             | Decrypt a list of (small) ciphertexts with a key.           |
| [**Policy API**](#Policy-API)                           |                                                             |
| [`/v1/policy/describe`](#describe-policy)               | Fetch information about a policy.                           |
| [`/v1/policy/assign`](#assign-policy)                   | Assign a policy to an identity.                             |
| [`/v1/policy/write`](#write-policy)                     | Create or overwrite a policy.                               |
| [`/v1/policy/read`](#read-policy)                       | Fetch a policy.                                             |
| [`/v1/policy/list`](#list-policy)                       | List policies.                                              |
| [`/v1/policy/delete`](#list-policy)                     | Delete a policy.                                            |
| [**Identity API**](#identity-api)                       |                                                             |
| [`/v1/identity/describe`](#describe-odentity)           | Fetch information about an identity.                        |
| [`/v1/identity/self/describe`](#self-describe-identity) | Fetch information about the identity issuing the request.   |
| [`/v1/identity/delete`](#delete-identity)               | Delete an identity.                                         |
| [`/v1/identity/list`](#list-identity)                   | List identities.                                            |
| [**Log API**](#log-api)                                 |                                                             |
| [`/v1/log/audit`](#audit-log)                           | Subscribe to the audit log.                                 |
| [`/v1/log/error`](#error-log)                           | Subscribe to the error log.                                 |


### Version

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `GET`    | `/version`                  | `application/json` |

Get the KES server version information.

#### Format

```
{
    "version": string
}
```

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

### API

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `GET`    | `/v1/api`                   | `application/json` |

Get a list of API endpoints supported by the server.

#### Format

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

### Metrics

| Method   | Path                     |
|:--------:|:------------------------:|
| `GET`    | `/v1/metrics`            |

Get server metrics. 

For example, the total number of requests.
Metrics return in the [Prometheus exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/).

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
```bash
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

#### Format

```json
{
    "version": string
    "uptime" : number       // in seconds
    "kms"    : {
        "state"  : string   // optional
        "latency": number   // optional, in milliseconds
    }
}
```

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

## Key API

### Create Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `POST`   | `/v1/key/create/<name>`     | `application/json` |

Create a new cryptographic key.


#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request POST \
    'https://play.min.io:7373/v1/key/create/my-key'
```

### Import Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `POST`   | `/v1/key/import/<name>`     | `application/json` |

Import a cryptographic key into the KES server.

#### Format

```json
{
   "bytes": string   // base64-encoded byte-string
}
```

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request POST \
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
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request DELETE \
    'https://play.min.io:7373/v1/key/delete/my-key'
```

### List Keys

| Method   | Path                        | Content-Type           |
|:--------:|:---------------------------:|:----------------------:|
| `GET`    | `/v1/key/list/<pattern>`    | `application/x-ndjson` |

List all key names that match the specified pattern.
The pattern `*` lists all keys.

#### Format

```json
{
   "name"      : string
   "created_at": string    // optional, time (RFC 3339) with sub-second precision
   "created_by": string    // optional, KES identity
   "error"     : string    // optional
}
```

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

### Generate Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `POST`   | `/v1/key/generate/<name>`   | `application/json` |

Generate a new data encryption key (DEK). 

The DEK is a *plaintext-ciphertext* pair.
The *plaintext* is a randomly generated key that can be used for cryptographic operations, such as encrypting data.
The *ciphertext* is the plaintext encrypted with the key `<name>` at the KES server.
Since this key never leaves the KES server, only the KES server can decrypt the generated *ciphertext*.

An application should use the plaintext DEK for a cryptographic operation.
The application should remember both the ciphertext DEK and which key `<name>` was used. 

#### Format

```json
{
   "context": string    // optional, base64-encoded byte-string
}
```

```json
{
   "plaintext" : string    // base64-encoded byte-string
   "ciphertext": string    // base64-encoded byte-string
}
```

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

### Encrypt Key

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `POST`   | `/v1/key/encrypt/<name>`    | `application/json` |

Decrypts and authenticates a small plaintext with the cryptographic key.
The plaintext must not exceed 1 MB. 
Use the **Encrypt Key** endpoint for wrapping small data, such as another cryptographic key. 

#### Format

```json
{
   "plaintext": string    // base64-encoded byte string
   "context"  : string    // optional, base64-encoded byte-string
}
```

```json
{
   "ciphertext": string    // base64-encoded byte-string
}
```

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

### Decrypt Key

| Method   | Path                        | Content-Type
|:--------:|:---------------------------:|:------------------:|
| `POST`   | `/v1/key/decrypt/<name>`    | `application/json` |

Decrypts a ciphertext with the cryptographic key. 
Returns the corresponding plaintext if and only if the ciphertext is authentic and has been produced by the named key.

#### Format
```json
{
   "ciphertext": string    // base64-encoded byte string
   "context"   : string    // optional, base64-encoded byte-string
}
```

```json
{
   "plaintext": string    // base64-encoded byte-string
}
```

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

### Bulk Decrypt Key

| Method   | Path                             | Content-Type
|:--------:|:--------------------------------:|:------------------:|
| `POST`   | `/v1/key/bulk/decrypt/<name>`    | `application/json` |

Decrypt a list of ciphertexts with the cryptographic key. 
Returns the corresponding plaintexts if and only if all ciphertexts are authentic and were produced by the named key.

```json
[
  {
     "ciphertext": string    // base64-encoded byte string
     "context"   : string    // optional, base64-encoded byte-string
  }
]
```

#### Format
```json
[
  {
    "plaintext": string    // base64-encoded byte-string
  }
]
```

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

## Policy API

### Describe Policy

| Method   | Path                            | Content-Type       |
|:--------:|:-------------------------------:|:------------------:|
| `GET`    | `/v1/policy/describe/<policy>`  | `application/json` |

Describes a policy by returning its metadata.
For example, retrieves who created the policy and when did they create it.

#### Format
```json
{
   "created_at": string    // RFC 3339 encoded timestamp
   "created_by": string    // KES identity
}
```

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

### Assign Policy

| Method   | Path                            | Content-Type       |
|:--------:|:-------------------------------:|:------------------:|
| `POST`   | `/v1/policy/assign/<policy>`    | `application/json` |

Assign a policy to an identity. 
An identity can have at most one assigned policy.
You can assign a policy to multiple identities.

The assigned policy defines which API calls an identity can perform.
- You cannot assign a policy to the admin identity. 
- An identity cannot assign a policy to itself.

#### Format
```json
{
   "identity": string    // KES identity
}
```

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request POST \
    --data '{"identity":"a4eac2d875d60ef25b068965c4e850aac074028dc576f3699276c6ea0ae1828f"}' \
    'https://play.min.io:7373/v1/identity/assign/my-policy'
```

### Write Policy

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `POST`   | `/v1/policy/write/<policy>` | `application/json` |

Create or update a policy at the KES server.

#### Format
```json
{
   "allow": [string]   // optional
   "deny" : [string]   // optional
}
```

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request POST \
    --data '{"allow":["/v1/key/generate/my-key","/v1/key/decrypt/my-key"]}' \
    'https://play.min.io:7373/v1/policy/write/my-policy'
```

### Read Policy

| Method   | Path                        | Content-Type       |
|:--------:|:---------------------------:|:------------------:|
| `GET`    | `/v1/policy/read/<policy>`  | `application/json` |

Get a policy from the KES server.

#### Format
```json
{
   "allow": [string]   // optional
   "deny" : [string]   // optional
}
```

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

### List Policy

| Method   | Path                        | Content-Type           |
|:--------:|:---------------------------:|:----------------------:|
| `GET`    | `/v1/policy/list/<pattern>` | `application/x-ndjson` |

List all policy metadata that match the specified pattern.
Use the pattern `*` to list all policy metadata.

#### Format
```json
{
   "name"      : string
   "created_at": string    // optional, time (RFC 3339) with sub-second precision
   "created_by": string    // optional, KES identity
   "error"     : string    // optional
}
```

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

### Delete Policy

| Method   | Path                         | Content-Type       |
|:--------:|:----------------------------:|:------------------:|
| `DELETE` | `/v1/policy/delete/<policy>` | `application/json` |

Delete a policy from the KES server.

**Caution:** All identities assigned to this policy  lose all authorization privileges.  

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request DELETE \
    'https://play.min.io:7373/v1/policy/delete/my-policy'
```

## Identity API

### Describe Identity

| Method   | Path                               | Content-Type       |
|:--------:|:----------------------------------:|:------------------:|
| `GET`    | `/v1/identity/describe/<identity>` | `application/json` |

Describes an identity by returning its metadata.
For example, use this endpoint to determine the currently assigned policy or whether it is an admin identity.

#### Format

```json
{
   "policy"    : string    // Name of assigned policy. Empty if admin is true
   "admin"     : boolean   // True if the identity is an admin
   "created_at": string    // RFC 3339 encoded timestamp
   "created_by": string    // KES identity
}
```

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

### Self Describe Identity

| Method   | Path                         | Content-Type       |
|:--------:|:----------------------------:|:------------------:|
| `GET`    | `/v1/identity/self/describe` | `application/json` |

Describes the identity issuing the request. 
It infers the identity from the TLS client certificate used to authenticate. 
It returns the identity and policy information for the client identity.

The self-describe API endpoint is publicly available and does not require any special permissions. 
Any client can query its own identity and policy information.

#### Format

```json
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

### Delete Identity

| Method   | Path                             | Content-Type       |
|:--------:|:--------------------------------:|:------------------:|
| `DELETE` | `/v1/identity/delete/<identity>` | `application/json` |

Deletes an identity from the KES server.

The client certificate that corresponds to the identity is no longer authorized to perform any API operations.
You cannot delete the admin identity.

#### Sample Request
```bash
$ curl \
    --key root.key \
    --cert root.cert \
    --request DELETE \
    'https://play.min.io:7373/v1/identity/delete/a4eac2d875d60ef25b068965c4e850aac074028dc576f3699276c6ea0ae1828f'
```

### List Identity

| Method   | Path                          | Content-Type           |
|:--------:|:-----------------------------:|:----------------------:|
| `GET`    | `/v1/identity/list/<pattern>` | `application/x-ndjson` |

List all identity metadata hat match the specified pattern.
Use the pattern `*` to list all identity metadata.

#### Format
```json
{
   "identity"  : string    // KES identity
   "policy"    : string
   "created_at": string    // optional, time (RFC 3339) with sub-second precision
   "created_by": string    // optional, KES identity
   "error"     : string    // optional
}
```

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

## Log API

### Audit Log

| Method   | Path                         | Content-Type           |
|:--------:|:----------------------------:|:----------------------:|
| `GET`    | `/v1/log/audit`              | `application/x-ndjson` |

Connect to the KES server audit log such that all new audit events stream to the client.

#### Format
```json
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

### Error Log

| Method   | Path                         | Content-Type           |
|:--------:|:----------------------------:|:----------------------:|
| `GET`    | `/v1/log/error`              | `application/x-ndjson` |


Connect to the KES server error log such that all new error events stream to the client.

#### Format
```json
{
    "message": string
}
```

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