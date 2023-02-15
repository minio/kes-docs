---
title: Concepts
date: 2023-02-08
lastmod: :git
draft: false
toc: true
---

This page gives a high-level overview of how KES works. 
It contains information about KES components, general architecture, and access controls. 

If you're looking for more concrete documentation, look at the [Configuration Guide]({{< relref "/tutorials/configuration.md" >}}).

- [Components](#components)
- [Architecture](#architecture)
- [Access Control](#access-control)
  - [Certificates](#certificates)
  - [Authentication](#authentication)
    - [Disabling Authentication During Testing](#disabling-authentication-during-testing)
  - [Authorization](#authorization)
  - [Policies](#policies)
    - [Policy-Identity Relation](#policy-identity-relation)
    - [The *root* Identity](#the-root-identity)

## Components

Consider a basic setup with one application instance and one KES server. 

The application connects to the KES server via [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security).
Then, the application uses the KES server API to perform operations like creating a new cryptographic key. 
The KES server talks to a central key-management system (KMS).

```goat
 .-----------.     .----------.     .-----.
| Application +<->+ KES Server +<->+  KMS  |
 '-----------'     '----------'     '-----'
```

The central KMS contains all of the state information, including the cryptographic keys. 
For any stateful operation, like creating a cryptographic master key, the KES server reaches out to the KMS. 

The KES server directly handles stateless operations, like generating a new data encryption key (DEK), requiring no interaction with the central KMS. 
As the majority of key-management operations are stateless, the KES server handles the load, including operations for encryption, decryption, and key derivation.  

## Architecture

Larger workloads demand larger resources, requiring more application instances. 
If all these instances would talk to a traditional KMS directly, e.g. a dedicated server or hardware appliance, they eventually exceed the KMS capabilities. 

[Kubernetes](https://kubernetes.io/) automatically adds or removes resources based on the current workload. 
However, a hardware security appliance designed to protect cryptographic keys typically cannot automatically scale up. 
For those appliances that support clustering, scaling means buying more expensive hardware.

In contrast, KES scales horizontally with the application.

```goat
 .----------.
+  .---------+--.          .----------.         .--------------.
 '+  .-----------+--.<--->+  .---------+-+<--->+   KMS Server   +
   '+  .-------------+-+   '+ KES Servers |     '--------------'
     '+   KES Clients   +    '-----------'  
       '---------------'
```

The KES server decouples the application from the KMS / Key Store and can handle almost all application requests on its own. 
It only has to talk to the Key Store when creating or deleting a cryptographic key. 

Similarly, the KES server only uses the KMS to encrypt or decrypt the cryptographic keys stored at or fetched from the Key Store. 
Therefore, the KES server reduces the load on the KMS / Key Store up to several orders of magnitude.

## Access Control

In general, all KES server operations require authentication and authorization. 
However, KES uses the same application-independent mechanism for both: mutual TLS authentication (mTLS).

```goat               
 .------------.                 .------------.
|  KES Client  +<------------->+  KES Server  |
 '------------'       TLS       '------------'
     (🗝️, 📜)           🔒           (📜, 🔑)
```                                    

The KES client needs a private key / public key pair and a [X.509 certificate](https://en.wikipedia.org/wiki/Public_key_certificate). 
In the following section, we explicitly distinguish the public key from the certificate to explain how authentication and authorization works.

### Certificates
KES relies on mutual TLS (mTLS) for authentication. 
Both the KES client and the KES server need their own private key / certificate pair. 

By default, each mTLS peer has to trust the issuer of the peer's certificate. 
This means that the client must trust the issuer of the server's certificate and the server must trust the issuer of the client's certificate.
If the same authority issued both the client's certificate and the server's certificate then the client and the server each only have to trust a single entity.
If different authorities issued the client's certificate and the server's certificate, then the client and the server must each trust both authorities.

With the [`Extended Key Usage`](https://tools.ietf.org/html/rfc5280#section-4.2.1.12) extension, the certificate describes the valid use cases for a particular public key. 
In case of mTLS the client certificate must have an Extended Key Usage containing `Client Authentication`.
Similarly, the server certificate has to have an Extended Key Usage containing `Server Authentication`. 
If your setup is not working as expected, check that the certificates contain the correct Extended Key Usage values.

> ProTip: You can view a certificate in a human-readable format via:
> ```sh
> openssl x509 -noout -text -in <your-certificate.cert>
> ```

### Authentication
In general, a KES server only accepts TLS connections from clients that can present a valid and authentic TLS certificate (📜) during the TLS handshake.

- A *valid* certificate means that the certificate is both well-formed and not expired.
- An *authentic* certificate means KES trusts the certificate authority that signed and issued the certificate .

When a KES client tries to establish a connection to the KES server, the TLS protocol checks that:
 - The KES client has the private key (🗝️) that corresponds to the public key in the 
   certificate (📜) presented by the client.
 - The certificate presented by a client was issued by a Certificate Authority (CA) that the KES server trusts.

**=>** *If the TLS handshake succeeds then the KES server considers the request authentic.*

#### Disabling Authentication During Testing

It is possible to skip the certificate verification during testing or development.

1. Start the KES server with the `--auth=off` option. 
2. Then clients still provide a certificate, but the server does not verify whether the certificate has been issued by a trusted CA. 
   Instead, the client can present a self-signed certificate.  

**CA-issued certificates are highly recommended for production deployments. Only use `--auth=off` for testing or development.**

### Authorization 

After determining the authenticity of a request, the KES server checks the client's authorization to perform the requested operation.
KES relies on a role and policy-based authorization model.
The authorization check compares the request to the policy associated to the client.

When the KES server receives an authentic client request, it computes the client _identity_ from the _client certificate_ using the client's _public key_.
After computing the identity, the KES server checks whether the identity has an associated named _policy_. 
If such an identity-policy mapping exists, the KES server validates that the request complies with the policy. 
Otherwise, the server rejects the request. 

**=>** *The KES server considers a request as authorized if the following statements are true:*
 - *An identity successfully computed from the client's certificate.*
 - *A policy associated to the identity exists.*
 - *The associated policy explicitly allows the operation that the request wants to perform.*

### Policies

The KES server policies define whether a client request is allowed. A policy contains a set
of allow and deny rules defining which API operations on which resources are allowed resp. explicitly
denied. Overall, KES uses policy definitions that are designed to be human-readable and easy
to reason about rather then providing the most flexibility.

In general, policy patterns have the following format:
```
/<API-version>/<API>/<operation>/[<argument0>/<argument1>/...]>
```
For example:
```goat
`/v1/key/create/my-key
   ^   ^   ^         ^
   |    \   \         \
   |     \   \         \
   v      v   v         v
 Version API Operation Argument
```

Each allow/deny rule is specified as [glob](https://en.wikipedia.org/wiki/Glob_(programming)) pattern.
So, a single rule can match an entire class of requests. Let's take a look at an example policy:
```yaml
policy:
  my-policy:
    allow:
    - /v1/metrics
    - /v1/key/create/my-key
    - /v1/key/generate/my-key*
    - /v1/key/decrypt/my-key*
    deny:
    - /v1/key/*/my-key-internal*
```

The `my-policy` contains four allow rules and one deny rule. A KES server will evaluate a policy as following:
 1. Evaluate all deny patterns. If any deny pattern matches then reject the request with a `prohibited by policy` error.
 2. Evaluate all allow patterns. If at least one allow pattern matches then KES will accept the request.
 3. Reject the request with the same `prohibited by policy` error since no allow rule matches.

In case of the `my-policy`, KES will allow creating a key named `my-key` but trying to create a key named `my-key2`
will fail since no allow rule matches `/v1/key/create/my-key2`. However, generating new data encryption keys (DEKs)
as well as decrypting encrypted (DEKs) using any key with a name prefix `my-key` is allowed. For example, both,
`/v1/key/generate/my-key` and `/v1/key/generate/my-key2` would be allowed.

Further, `my-policy` contains a deny rule that prevents any key API operation (`key/*/`) for all resources (i.e. keys)
with a name prefix `my-key-internal`. So, for example `/v1/key/create/my-key-internal`, `/v1/key/generate/my-key-internal`
and `/v1/key/generate/my-key-internal2` would all be rejected.

For more information about policies and more examples refer to: [Policy Configuration](https://github.com/minio/kes/wiki/Configuration#policy-configuration)  
For a comprehensive overview over the KES server APIs refer to: [Server API](https://github.com/minio/kes/wiki/Server-API#api-overview)

#### Policy-Identity Relation

The policy-identity mapping is a one-to-many relation. So, there can be arbitrary many identities associated to
the same policy. However, the same identity can only be associated to one policy at one point in time. But
there is one important caveat here:

The one-to-many relation only holds for one server. So, the same identity `A` can be associated to one policy `P`
at the KES server `S1` but can also be associated to a different policy `Q` at the KES server `S2`. So, the two KES servers `S1` and `S2` have distinct and independent policy-identity sets.

Further, you may recall that the KES server computes the client identity from its certificate:
**`🆔 ═ SHA-256(📜.PublicKey)`**. However, when specifying the identity-policy mapping it is totally
valid to associate an arbitrary identity value to a policy. So, the identity value does not need to be
an actual SHA-256 hash value. It can be `"_"`, `"disabled"`, `"foobar123"` or literally any other value.
This is in particular useful for dealing with the special *root* identity.

#### The *root* Identity

The KES server has a special *root* identity that **must** be specified - either via the configuration file or
the `--root` CLI option. In general, *root* is like any other identity except that it cannot be associated to any policy but can perform arbitrary API operations.

So, the *root* identity is especially useful for initial provisioning and management tasks. However, within centrally managed and/or automated deployments - like [Kubernetes](https://kubernetes.io/) - *root* is not necessary and only a security risk. If an attacker gains access to the *root's* private key and certificate it can perform arbitrary operations.

Even though a *root* identity must always be specified, it is possible to *effectively disable* it. This can be done by specifying a *root* identity value that **never** will be an actually (SHA-256) hash value - for example
`--root=_` (underscore) or `--root=disabled`. Since **`🆔 ═ SHA-256(📜.PublicKey)`** will never be e.g.
`disabled` it becomes impossible to perform an operation as *root*.

> Note that even though *root* can perform arbitrary API operation, it cannot change the *root* identity itself.
> The *root* identity can only be specified/changed via the CLI or configuration file. So, an attacker cannot 
> become the *root* identity by tricking the current *root*. The attacker either has to compromise *root's*
> private key or change the initial server configuration.