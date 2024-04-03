---
title: Configuration
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
weight: 40
---

This page provides information about KES configuration options for a KES Client and a KES Server.

## KES Client

As a basic standard configuration, a KES client needs to know the

- KES server endpoint
- KES client's own client certificate
- Corresponding private key to the client certificate

You can provide these values in different ways, such as through environment variables at the command line or through a Software Development Kit.

### Command Line

From the command line, use the following environment variables to define the three basic settings.

- The KES server endpoint:
  ```sh {.copy}
  export KES_SERVER=https://127.0.0.1:7373
  ```
- The client X.509 certificate:
  ```sh {.copy}
  export KES_CLIENT_CERT=$HOME/root.cert
  ```
- The private key that corresponds to the public key embedded in the certificate:
  ```sh {.copy}
  export KES_CLIENT_KEY=$HOME/root.key
  ```

### SDK

When using an SDK, provide a server endpoint and fetch the client's private key and certificate:

```Go {.copy}
package main

import (
	"crypto/tls"
	"log"

	"github.com/minio/kes"
)

func main() {
	const (
		endpoint = "https://127.0.0.1:7373"
		certFile = "./root.cert"
		keyFile  = "./root.key"
	)
	certificate, err := tls.LoadX509KeyPair(certFile, keyFile)
	if err != nil {
		log.Fatalln(err)
	}

	client := kes.NewClient(endpoint, certificate)

	// now use the client to perform operations...
	_ = client
}
```

## KES Server

The KES server needs four pieces of information as a base configuration:

1. TCP address (that is, an IP address and port) to listen for incoming requests
2. X.509 certificate 
3. A corresponding private key 
4. A root identity. 

You can specify these parameters with command line (CLI) flags or by a config file. 
If you set a parameter in both the command line and in the config file, the command line setting takes precedence.

If you do not specify the TCP address, the KES server listens on all available network interfaces on port `7373`.

The following command starts a KES server listening on all network interfaces on port `7373` with the X.509 TLS certificate `server.crt`, the corresponding private key `server.key`, and the root identity taken from the environment variable `$ROOT_IDENTITY`:

```sh {.copy}
kes server --cert server.crt --key private.key --root $ROOT_IDENTITY
```

### Config File

Customize KES server behavior with a YAML config file. 

The config file is separated into various sections:

 - A general server configuration section including the server address and root identity.
 - A [TLS section](#tls-configuration) to specify the server key/certificate and TLS proxy configuration.
 - An [API section](#api-configuration) to enable or disable authentication for specific endpoints.
 - A [policy section](#policy-configuration) to control who can perform various API operations.
 - A [cache section](#cache-configuration) to control how long the KES server caches keys in memory.
 - A [logging section](#logging-configuration) to control what log messages write to `STDOUT` and `STDERR`.
 - A [KMS / key store section](#kms-configuration) specifies where to store and fetch keys.

#### TLS Configuration

Use the TLS configuration section to specify the X.509 certificate of the KES server and the corresponding private key:

```yaml {.copy}
tls:
  cert: server.crt
  key:  server.key
```

Optionally, also configure a TLS proxy in this section. 
See the separate [TLS Proxy page]({{< relref "concepts/tls-proxy" >}}) for more information.

#### API Configuration

By default, KES requires a valid TLS certificate for all API calls.
You can change this behavior for specific API endpoints to allow requests to the endpoints without a certificate.

{{< admonition type="caution" >}}
The default behavior of the KES API endpoints should be suitable for most situations.
Only customize endpoints for a specific need.
{{< /admonition >}}

When you disable authentication for at least one endpoint, KES no longer requires a certificate for a client to call _any_ API endpoint.
However, the request must still include a certificate for KES to successfully process a call to any API endpoint that requires authentication.

This change means that on KES servers with at least one endpoint configured to disable authentication, clients do not receive a TLS error on failure, but an HTTP error instead.

You can disable authentication for the following API endpoints:

- `/v1/ready`
- `/v1/status`
- `/v1/metrics`
- `/v1/api`

For example, to skip authentication for the endpoints that allow readiness probes and status checks, add the following to the configuration file:

```yaml {.copy}
api:
  /v1/ready:
    skip_auth: true
    timeout:   15s
  /v1/ready:
    skip_auth: false
    timeout:   15s
```

See [link text]({{< relref "concepts/server-api.md" >}}) for information on the KES API.

#### Cache Configuration

Use the cache configuration section to specify how the KES server should cache keys fetched from the external KMS.

```yaml {.copy}
cache:
  expiry:
    any:    5m0s
    unused: 20s
```

Control how often the KES server has to fetch keys from the external KMS by specifying different expiry values for `any` cached key or `unused` cache keys. 

For example, `any: 5m0s` means that the KES server clears the in-memory cache every 5 min.
`unused: 20s` means that the KES server removes any key from the cache that has not been used within last 20 seconds.

The choice of cache expiry values is a trade-off between security and performance. 
By setting a value of `any: 1m0s`, the KES server has to communicate to the external KMS 5x more often compared to `any: 5m0s`.
However, the `any: 1m0s` setting reduces the time the KES server can act without any control by the external KMS.

The following values may help you make a decision.

|  Security Level  |   any   | unused |
|:-----------------|:-------:|:------:|
| *liberal*        |  `5m0s` | `30s`  |
| *moderate*       |  `1m0s` | `20s`  |
| *conservative*   |   `30s` |  `5s`  |


#### Logging Configuration

Use the log configuration section to specify which log events write to `STDOUT` or `STDERR`.
The KES server distinguishes error and audit log events. 
By default, the server writes error events to `STDERR` but does not log audit events to `STDOUT`. 

Usually, error events indicate that some configuration or operational error occurred. 
For example, the KES Server logs an error event when fetching a key from the KMS fails for an unexpected reason.

The KES Server produce an audit event whenever it accepts a client request.
The audit event describes the request-response pair and contains information about who issued the request.

```yaml {.copy}
log:
  error: on  # To disable error logging to STDERR - explicitly set it to off
  audit: off # To enable audit logging to STDOUT - explicitly set it to on
```

The `log` section **only** controls event logging to `STDOUT` and `STDERR`. 
The KES server also provides audit and error log tracing through the API with [`/v1/log/audit/trace`](https://github.com/minio/kes/wiki/Server-API#trace-audit-log) and [`/v1/log/error/trace`](https://github.com/minio/kes/wiki/Server-API#trace-error-log).

A client with sufficient permissions can subscribe to the audit or error log at any point in time.

#### Policy Configuration

In the policy configuration section you define policies and identity-based access control rules.
The policy section can contain arbitrary many policy definitions. 
Each policy must have an unique name - e.g. `my-policy`. 
Let's take a look at an example policy:

```yaml {.copy}
policy:
  my-policy:
    allow:
    - /v1/key/create/my-key
    - /v1/key/generate/my-key
    - /v1/key/decrypt/my-key
    deny:
    - /v1/key/*/my-key-internal
```

A policy explicitly allows API operations with its API allow and deny rules. 
Each rule is a [`glob`](https://en.wikipedia.org/wiki/Glob_(programming)) pattern.
A client request must match **at least one** allow and **no** deny pattern. 
Otherwise, the server rejects the request. 

A KES server evaluates a policy as follows:

 1. Evaluate all deny patterns. 
    If any deny pattern matches, reject the request with a `prohibited by policy` error. 
 2. Evaluate all allow patterns. 
    If at least one allow pattern matches, then KES accepts the request.
 3. If no allow pattern matches, reject the request with a `prohibited by policy` error.

It is not necessary to deny specific API operations. 
Instead, only use deny rules for fine-grain access control. 
The KES Server denies any API operation a policy does not not explicitly allow. 
Explicit deny rules take precedence over allow rules. 

The policy `my-policy` discussed earlier grants access to the `/v1/key` API. 
In particular, the policy allows three operations: `create`, `generate` and `decrypt`. 
However, only the key `my-key` can be used. 
Therefore, the `my-policy` policy has the following semantics:

|         Request              |  Response  |                          Reason                            |
|:-----------------------------|:----------:|:-----------------------------------------------------------|
| `/v1/key/create/my-key`      |    allow   | Request path matches 1st policy path                       |
| `/v1/key/generate/my-key`    |    allow   | Request path matches 2nd policy path                       |
| `/v1/key/create/my-key2`     |    deny    | `my-key2` does not match `my-key`                          |
| `/v1/key/delete/my-key`      |    deny    | `delete` does not match `create`, `generate` nor `decrypt` |
| `/v1/policy/write/my-policy` |    deny    | `policy` does not match `key`                              |
| `/v0/key/create/my-key`      |    deny    | `v0` does not match `v1`                                   |

Specifying the exact request paths is quite inflexible. 
Therefore, a policy path is a glob pattern. 
Let's adjust the `my-policy` policy as following:

```yaml {.copy}
policy:
  my-policy:
    allow:
    - /v1/key/create/my-key*
    - /v1/key/generate/my-key*
    - /v1/key/decrypt/my-key*
    - /v1/key/delete/my-key
    deny:
    - /v1/key/*/my-key-internal
```

Now, the `my-policy` policy would have the following semantics:

|         Request                   |  Response  |                          Reason                             |
|:----------------------------------|:----------:|:------------------------------------------------------------|
| `/v1/key/create/my-key`           |    allow   | Request path matches 1st policy path                        |
| `/v1/key/generate/my-key`         |    allow   | Request path matches 2nd policy path                        |
| `/v1/key/create/my-key2`          |    allow   | Request path matches 1st policy path                        |
| `/v1/key/delete/my-key`           |    allow   | Request path matches 4th policy path                        |
| `/v1/key/delete/my-key2`          |    deny    | `delete/my-key2` does not match `delete/my-key` (No `*`)    |
| `/v1/key/decrypt/my-key-internal` |    deny    | `decrypt/my-key-internal` is explicitly denied              |

By using glob patterns the policy is quite flexible but still easy to read for humans. 

For example:
 - `/v1/key/create/*`: Allow creating keys with arbitrary names.
 - `/v1/key/*/my-key`: Allow all key API operations (`create`, `generate`, ...) for the key `my-key`.
 - `/v1/key/*/*`: Allow all key API operations for any key.

For example, in the updated policy example above, the deny rule `/v1/key/*/my-key-internal` denies any API operation using the key `my-key-internal`.

Note that a glob wildcard (`*` or `?`) only applies to the current path segment. 
`/v1/key/*` and `/v1/key/*/*` are not identical. 
The first rule allows arbitrary key API operations, but only for empty key names. 
The second rule allows arbitrary key API operations for arbitrary keys.

For more details, see the comprehensive list at the [server APIs page]({{< relref "concepts/server-api" >}}).

##### Policies and Identities

Use the policy section to define which policy applies to which identity. 
An identity can be computed from the X.509 certificate as follows:

```sh {.copy}
kes identity of <path-to-certificate-file>
```

You can assign one or multiple identities to a policy in the policy section. 
You can specify an identity in two ways:

- insert the identity itself 
- specify an environment variable name
 
If you use an environment variable, the KES server inserts the value on startup.

```yaml {.copy}
policy:
  my-policy:
    allow:
    - /v1/key/create/my-key
    - /v1/key/generate/my-key
    - /v1/key/decrypt/my-key
    identities:
    - 3ecfcdf38fcbe141ae26a1030f81e96b753365a46760ae6b578698a97c59fd22
    - ${MY_APP_IDENTITY}
```

{{< admonition type="note" >}}
You must set all expected environment variables before starting the server.
The server starts even if an environment variable is not present or does not contain a "valid" identity. 
{{< /admonition >}}


#### Key Configuration

Use the key configuration section to declare cryptographic keys that should exist *before* the KES server starts accepting requests. 

```yaml {.copy}
keys:
  - name: "my-key"
  - name: "my-key-2"
```

At start, the KES server makes sure that the specified keys exist. 
The KES Server tries to create any non-existing keys *before* it accepts client requests and exits if it fails to create a key.

#### KMS Configuration

Use the KMS/key store configuration section to specify where the KES server stores and fetches master keys. 
This should be a KMS that provides a secure storage element or an encrypted key store. 
However, for testing and development, you can store master keys in-memory or on the filesystem.

If you do not specify a KMS/key store in the config file, the KES server creates master keys in memory. 
This is only useful for testing or development setups, as all master keys are lost when you restart the server.

To create a persistent testing or development setup, specify a filesystem key store in the config file: 

```yaml {.copy}
keystore:
  fs:
    path: ./keys # The key store directory. Keys will be created inside ./keys/
```

For production setups, use a secure key store backed by a KMS such as [Hashicorp Vault](https://github.com/minio/kes/wiki/Hashicorp-Vault-Keystore). 

## Sample Configuration File

{{< include "_includes/server-config.md" >}}