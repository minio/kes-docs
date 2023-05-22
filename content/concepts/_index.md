---
title: Concepts
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
heading: true
---

Welcome to the KES documentation site.
These pages give a high-level overview of how KES works, information about KES components, general architecture, and access controls. 

For more detailed documentation on setting up KES, see the [Configuration Guide]({{< relref "/tutorials/configuration.md" >}}).

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

{{< admonition type="tip" >}}
View a certificate in a human-readable format with the following command:

```sh
openssl x509 -noout -text -in <your-certificate.cert>
```
{{< /admonition >}}

### Authentication
In general, a KES server only accepts TLS connections from clients that can present a valid and authentic TLS certificate (📜) during the TLS handshake.

- A *valid* certificate means that the certificate is both well-formed and not expired.
- An *authentic* certificate means KES trusts the certificate authority that signed and issued the certificate .

When a KES client tries to establish a connection to the KES server, the TLS protocol checks that:
 - The KES client has the private key (🗝️) that corresponds to the public key in the 
   certificate (📜) presented by the client.
 - The certificate presented by a client was issued by a Certificate Authority (CA) that the KES server trusts.

If the TLS handshake succeeds, then the KES server considers the request authentic.

#### Disabling Authentication During Testing

It is possible to skip the certificate verification during testing or development.

1. Start the KES server with the `--auth=off` option. 
2. Then clients still provide a certificate, but the server does not verify whether the certificate has been issued by a trusted CA. 
   Instead, the client can present a self-signed certificate.  

{{< admonition type="caution" >}}
CA-issued certificates are highly recommended for production deployments. 
Only use `--auth=off` for testing or development.
{{< /admonition >}}

### Authorization 

After determining the authenticity of a request, the KES server checks the client's authorization to perform the requested operation.
KES relies on a role and policy-based authorization model.
The authorization check compares the request to the policy associated to the client.

When the KES server receives an authentic client request, it computes the client _identity_ from the _client certificate_ using the client's _public key_.
After computing the identity, the KES server checks whether the identity has an associated named _policy_. 
If such an identity-policy mapping exists, the KES server validates that the request complies with the policy. 
Otherwise, the server rejects the request. 

{{< admonition type="note">}}
The KES server considers a request as authorized if the following statements are true:
 - *An identity successfully computed from the client's certificate.*
 - *A policy associated to the identity exists.*
 - *The associated policy explicitly allows the operation that the request wants to perform.*
{{< /admonition >}}

### Policies

The KES server policies determine whether to allow a client request. 
A policy contains a set of rules that define which API operations are allowed or denied on which resources. 
KES uses policy definitions designed for human-readability and comprehension rather than flexibility.

In general, policy patterns have the following format:

```
/<API-version>/<API>/<operation>/[<argument0>/<argument1>/...]
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

Write each allow/deny rule as a [glob](https://en.wikipedia.org/wiki/Glob_(programming)) pattern.
The glob pattern allows a single rule to match an entire class of requests. 

A KES server evaluates a policy as follows:

 1. Evaluate all deny patterns. 
    If any deny pattern matches, reject the request with a `prohibited by policy` error.
 2. Evaluate all allow patterns. 
    If at least one allow pattern matches, KES accepts the request.
 3. If no allow pattern matches, reject the request with a `prohibited by policy` error.

#### Policy Example

Let's take a look at an example policy:

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

The `my-policy` contains four allow rules and one deny rule. 

KES processes the `deny` rule first.
`my-policy` contains a deny rule that prevents any key API operation (`key/*/`) for all resources (i.e. keys) with a name prefix `my-key-internal`. 
If a client submits any type of API operation using a key with that prefix, KES prohibits it.
For example, KES would reject any of the following under this policy:
- `/v1/key/create/my-key-internal`
- `/v1/key/generate/my-key-internal` 
- `/v1/key/generate/my-key-internal2`

If the request does not match any `deny` pattern, KES evaluates the request against the `allow` rules.

In case of the `my-policy`, KES allows requests under the policy to create a key named `my-key`. 
If the user tries to create a key named `my-key2` or any other character combination, the request returns with the `prohibited by policy` error since no `allow` rule matches the request. 

When the user requests to generate new data encryption keys (DEKs) or to decrypt encrypted (DEKs), the policy allows any key with a name prefix of `my-key`. 
KES allows either `/v1/key/generate/my-key` or `/v1/key/generate/my-key2`, but prohibits `/v1/key/generate/key-to-generate1`.


#### See Also
- For more information about policies and more examples refer to: [Policy Configuration]({{< relref "/tutorials/configuration.md#policy-configuration" >}})  
- For a comprehensive overview over the KES server APIs refer to: [Server API]({{< relref "Server-API#api-overview" >}})

### Policy-Identity Relation

The policy-identity mapping is a one-to-many relation, meaning you may associate many identities to the same policy. 
However, you can only associate an identity to one policy at a time on a KES server. 

Multiple KES servers can each have their own policy-identify relationship sets. 
For example, KES server `Server1` may associate identity `Ann` to the policy `Policy1` 
KES server `Server2` can associate the same identity, `Ann` to a different policy, `Policy2`.  
The two KES servers `Server1` and `Server2` have distinct and independent policy-identity relationships.

### The *`root`* Identity

As previously described, the KES server computes the client identity from its certificate. 
This normally computes to a cryptographic SHA-256 value.
However, when specifying the identity-policy mapping it is totally valid to associate an arbitrary identity value to a policy. 
The associated identity can be `"_"`, `"disabled"`, `"foobar123"` or any other value.
This is in particular useful for dealing with the special *root* identity.

The KES server has a special *`root`* identity that you **must** specify.
You specify the *`root`* identify either by the KES [configuration file]({{< relref "/tutorials/configuration.md" >}}) or the `--root` CLI option. 
In general, *`root`* acts like any other identity with the exception that it cannot be associated to a policy.
Instead, *`root`* can perform arbitrary API operations.

The *`root`* identity is especially useful for initial provisioning and management tasks.

Centrally managed or automated deployments, such as [Kubernetes](https://kubernetes.io/), do not require the *`root`* identity, which serves only as a security risk. 
If an attacker gains access to the *`root`* identity's private key and certificate, the attacker can perform arbitrary operations.

Even though a *`root`* identity must always be specified, you can *effectively disable* it. 
This can be done by specifying a *`root`* identity value that will **never** be an actual (SHA-256) hash value. 
For example `--root=_` (underscore) or `--root=disabled`.
Since KES does not ever compute a cryptographic identity to `_` or `disabled`, it becomes impossible to perform an operation as *`root`*.

{{< admonition type="note" >}}
Even though *`root`* can perform arbitrary API operations, it cannot change the *`root`* identity itself.
The *`root`* identity can only be specified or changed through the CLI or the configuration file. 
Therefore, an attacker cannot become the *`root`* identity by tricking the current *`root`*. 
The attacker either has to compromise the *`root`* identity's private key or change the initial server configuration.
{{< /admonition >}}