---
title: Configuration
date: 2023-02-08
draft: false
---

The configuration section provides general information about KES configuration and
helps you find the right knob to tweak for your use case.

- [KES Client](#kes-client)
  - [Command Line](#command-line)
  - [SDK](#sdk)
- [KES Server](#kes-server)
  - [Config File](#config-file)
    - [TLS Configuration](#tls-configuration)
    - [Cache Configuration](#cache-configuration)
    - [Logging Configuration](#logging-configuration)
    - [Policy Configuration](#policy-configuration)
    - [Key Configuration](#key-configuration)
    - [KMS Configuration](#kms-configuration)

## KES Client

In general, a KES client needs to know the KES server endpoint, its own client certificate and the corresponding
private key.

### Command Line

For example, the KES CLI client requires the following three environment variables:
 - The KES server endpoint:
   ```sh
   export KES_SERVER=https://127.0.0.1:7373
   ```
 - The client X.509 certificate:
   ```sh
   export KES_CLIENT_CERT=$HOME/root.cert
   ```
 - The private key that corresponds to the public key embedded in the certificate:
   ```sh
   export KES_CLIENT_KEY=$HOME/root.key
   ```

### SDK

When using an SDK, you need to provide a server endpoint and fetch the client's private key
and certificate:
```Go
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

The KES server needs at least a TCP address (e.g. IP and port) to listen for incoming requests, a X.509
certificate as well as the corresponding private key and a root identity. These four parameters can be
specified via CLI flags or via the config file. If a CLI flag is present it takes precedence over the
corresponding config file entry. If no TCP address is specified the KES server will try to listen on all
available network interfaces on port `7373`.

The following command will start a KES server listening on all network interfaces on port `7373` with the
X.509 TLS certificate `server.crt`, the corresponding private key `server.key` and the root identity taken
from the environment variable `$ROOT_IDENTITY`:
```sh
kes server --cert server.crt --key private.key --root $ROOT_IDENTITY
```

### Config File

The KES server behavior can be customized via a YAML config file. The config file is separated into various
sections:
 - A general server configuration section - e.g. the server address and root identity.
 - A [TLS section](#tls-configuration). - e.g. the server key/certificate and TLS proxy configuration.
 - A [cache section](#cache-configuration). It controls how (long) the KES server caches keys in memory.
 - A [logging section](#logging-configuration). It controls what log messages are written to STDOUT and STDERR.
 - A [policy section](#policy-configuration). It controls who can perform which API operations.
 - A [KMS / key store](#kms-configuration) section. It specifies where to store and fetch keys.

#### TLS Configuration

In the TLS configuration section you usually specify the X.509 certificate of the KES server and the
corresponding private key:
```yaml
tls:
  cert: server.crt
  key:  server.key
```

Further, the TLS section contains a TLS proxy configuration section. Since KES uses mTLS for authentication
it is not possible to insert a TLS proxy between the client and the server without specific configuration.
For a detailed explanation, recommendations and configuration examples take a look at our
[TLS proxy](https://github.com/minio/kes/wiki/TLS-Proxy) page.

#### Cache Configuration

In the cache configuration section you specify how the KES server should cache keys fetched from the external
KMS.
```yaml
cache:
  expiry:
    any:    5m0s
    unused: 20s
```
By specifying different expiry values you can control how often the KES server has to fetch keys from the
external KMS again. For example, `any: 5m0s` means that the KES server clears the in-memory cache every 5 min.
Similarly, `unused: 20s` means that the KES server removes any key from the cache that has not been used within
last 20 seconds.

The choice of cache expiry values is a trade-off between security and performance. For example, if you set
`any: 1m0s` then the KES server has to communicate to the external KMS 5x more often compared to `any: 5m0s`.
However, you would also reduce the time window where the KES server can act without any control by the external
KMS.

The following values may help you make a decision.

|  Security Level  |   any   | unused |
|:-----------------|:-------:|:------:|
| *liberal*        |  `5m0s` | `30s`  |
| *moderate*       |  `1m0s` | `20s`  |
| *conservative*   |   `30s` |  `5s`  |


#### Logging Configuration

In the log configuration section you specify which log events are written to STDOUT resp. STDERR.
In general, the KES server distinguishes error and audit log events. By default the server will
write error events to STDERR but does not log audit events to STDOUT. 

Usually, error events indicate that some configuration or operational error occurred. For example,
an error event is logged when fetching a key from the KMS fails for some unexpected reason.
In contrast to error events, a audit event is produced whenever the KES server accepts a client request.
The audit event describes the request-response pair and contains information about who issued the request.

Since a KES server may produce many audit events, logging to STDOUT is disabled by default.
```yaml
log:
  error: on  # To disable error logging to STDERR - explicitly set it to off
  audit: off # To enable audit logging to STDOUT - explicitly set it to on
```

Note that the `log` section **only** controls event logging to STDOUT and STDERR. The KES server
also provides audit and error log tracing via the
[`/v1/log/audit/trace`](https://github.com/minio/kes/wiki/Server-API#trace-audit-log) and
[`/v1/log/error/trace`](https://github.com/minio/kes/wiki/Server-API#trace-error-log) APIs.
A client (with sufficient permissions) can subscribe to the audit or error log at any point in time.

#### Policy Configuration

In the policy configuration section you define policies and identity-based access control rules.
The policy section can contain arbitrary many policy definitions. Each policy must have an unique
name - e.g. `my-policy`. Let's take a look at an example policy:
```yaml
policy:
  my-policy:
    allow:
    - /v1/key/create/my-key
    - /v1/key/generate/my-key
    - /v1/key/decrypt/my-key
    deny:
    - /v1/key/*/my-key-internal
```

A policy explicitly allows API operations via its API allow / deny rules. Each rule is a
[`glob`](https://en.wikipedia.org/wiki/Glob_(programming)) pattern and a client request
has to match **at least one** allow and **no** deny pattern. Otherwise, the server will
reject the request. 

A KES server will evaluate a policy as following:
 1. Evaluate all deny patterns. If any deny pattern matches then reject the request with
    a `prohibited by policy` error. 
 2. Evaluate all allow patterns. If at least one allow pattern matches then KES will accept
    the request.
 3. Reject the request with the same `prohibited by policy` error since no allow rule matches.

So, it's not necessary to deny specific API operations in general. Instead, deny rules should
only be used for fine-grain access control. Any API operation that is not explicitly allowed
will be denied by default. Further, notice that deny rules take precedence over allow rules. 

Looking at the `my-policy` policy again, it grants access to the `/v1/key` API. In particular,
it allows three operations: `create`, `generate` and `decrypt`. However, only the key `my-key`
can be used. Therefore, the `my-policy` policy has the following semantics:
|         Request              |  Response  |                          Reason                            |
|:-----------------------------|:----------:|:-----------------------------------------------------------|
| `/v1/key/create/my-key`      |      ✓     | Request path matches 1st policy path                       |
| `/v1/key/generate/my-key`    |      ✓     | Request path matches 2nd policy path                       |
| `/v1/key/create/my-key2`     |      ✗     | `my-key2` does not match `my-key`                          |
| `/v1/key/delete/my-key`      |      ✗     | `delete` does not match `create`, `generate` nor `decrypt` |
| `/v1/policy/write/my-policy` |      ✗     | `policy` does not match `key`                              |
| `/v0/key/create/my-key`      |      ✗     | `v0` does not match `v1`                                   |

Specifying the exact request paths is quite inflexible. Therefore, a policy path is a glob pattern. Let's
adjust the `my-policy` policy as following:
```yaml
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
|         Request                   |  Response  |                          Reason                                |
|:----------------------------------|:----------:|:---------------------------------------------------------------|
| `/v1/key/create/my-key`           |      ✓     | Request path matches 1st policy path                           |
| `/v1/key/generate/my-key`         |      ✓     | Request path matches 2nd policy path                           |
| `/v1/key/create/my-key2`          |      ✓     | Request path matches 1st policy path                           |
| `/v1/key/delete/my-key`           |      ✓     | Request path matches 4th policy path                           |
| `/v1/key/delete/my-key2`          |      ✗     | `delete/my-key2` does not match `delete/my-key` (No `*`)       |
| `/v1/key/decrypt/my-key-internal` |      ✗     | `decrypt/my-key-internal` is explicitly denied via a deny rule |

By using glob patterns the policy is quite flexible but still easy to read for humans. For example:
 - `/v1/key/create/*`: Allow creating keys with arbitrary names.
 - `/v1/key/*/my-key`: Allow all key API operations (`create`, `generate`, ...) for the key `my-key`.
 - `/v1/key/*/*`: Allow all key API operations for arbitrary keys.

For example, observe that the deny rule `/v1/key/*/my-key-internal` denies any API operation on the key
`my-key-internal`.

Note that a glob wildcard (`*` or `?`) only applies to the current path segment. So `/v1/key/*` and
`/v1/key/*/*` are not identical. The first will allow arbitrary key API operations but only for empty
key names - which is not really useful. The later will allow arbitrary key API operations for arbitrary
keys.

You can find a comprehensive list of server APIs [here](https://github.com/minio/kes/wiki/Server-API).

***

In the policy section, you can also define which policy applies to which identity. An identity can be computed
from the X.509 certificate - for example:
```sh
kes identity of <path-to-certificate-file>
```
You can assign one or multiple identities to a policy in the policy section. In general,
you can specify an identity *directly* by inserting the identity itself or *indirectly*
by specifying a environment variable name. The KES server will insert the value of
the referenced environment variable on startup.
```yaml
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

Note that the server will not fail if an environment variable is not present
or not a "valid" identity. It's your responsibility to ensure that all env.
variables are set to the expected values before starting the server.

#### Key Configuration

In the key configuration section you can declare cryptographic keys that should
exist *before* the KES server starts accepting requests. It allows to create keys
in a declarative way:

```yaml
keys:
  - name: "my-key"
  - name: "my-key-2"
```

When starting a KES server, it will make sure that the specified keys exist. The KES
the server will try to create any non-existing key *before* it accepts client requests and
will exit if it fails to create a key.

#### KMS Configuration

In the KMS / key store configuration section you can specify where the KES server
stores and fetches master keys. In general, this should be a KMS that provides a
secure storage element or an encrypted key store. However, for testing and development,
it is also possible to store master keys in-memory or on the filesystem.

If you don't specify a KMS / key store in the config file then the KES server will
create master keys in memory. This is only useful for testing or development setups
because all master keys will be gone once you restart the server.

To create a persistent testing or development setup, specify a filesystem key store
in the config file: 
```yaml
keystore:
  fs:
    path: ./keys # The key store directory. Keys will be created inside ./keys/
```

For production setups, only secure key stores backed by a KMS - for example
[Hashicorp Vault](https://github.com/minio/kes/wiki/Hashicorp-Vault-Keystore) - are
recommended. 