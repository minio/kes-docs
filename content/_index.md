---
title: MinIO Key Encryption Service
date: 2022-11-01
lastmod: :git
draft: false
tableOfContents: true
---

This site provides information about [MinIO](https://min.io?ref=kes-docs)'s Key Encryption Service (KES) project.

The documentation includes:

- architecture and configuration guides
- best practices
- general documentation

## Why KES

KES is a stateless and distributed key-management system for high-performance applications. 
KES serves as the bridge between modern applications that run as containers on [Kubernetes](https://kubernetes.io) and centralized Key Management Services (KMS). 
By default, we designed KES to be simple, scalable, and secure. 
With simplified configuration options compared to other services, KES does not require a deep understanding of secure key-management or cryptography principles.

If you're new to KES you may want to start in one of the following pages:

- Jump right in with the [Getting Started guide]({{< relref "/tutorials/getting-started" >}})
- Review set up options with the [configuration guide]({{< relref "/tutorials/configuration.md" >}}) 
- Learn how KES works at our [Concepts page]({{< relref "concepts/_index.md" >}}).

## KES Access Control

KES uses mutual TLS authentication (mTLS) for performing both authentication and authorization of clients making requests to the KES server. 

### Authentication

Both the client and server present their x.509 certificate and corresponding private key to their peer. 
The server only accepts the connection if the client certificate is valid and authentic:

- A "valid" certificate is well-formed and current (i.e. not expired). 

  Authentication with mTLS also requires the following [Extended Key Usage](https://tools.ietf.org/html/rfc5280#section-4.2.1.12) extensions for the client and server.

  - Client Authentication (`extendedKeyUsage = clientAuth`)
  - Server Authentication (`extendedKeyUsage = serverAuth`)

- An "authentic" certificate is issued by a trusted Certificate Authority (CA). 
  Both client and server *must* include the peer certificate CA in their local system trust store.

{{< admonition type="note" >}}

You can start the KES server with the `kes server --auth`  option to perform mTLS with untrusted or self-signed certificates during testing or early development. 

MinIO strongly recommends only allowing trusted certificates in production environments.

{{< /admonition >}}

### Authorization

KES uses Policy-Based Access Control (PBAC) to determine what operations a given client has permission to perform. 
Each policy consists of one or more identities, where each identity corresponds to the SHA-256 hash of an x.509 certificate. 
The server only allows the client to perform the requested operation if the following are true:

- A policy on the KES server contains the client identity.
- The policy explicitly allows the requested operation.

If no such policy exists on the KES server *or* if the policy does not explicitly allow the requested operation, the KES server denies the client's request.

### KES Policies

KES uses policy-based access control (PBAC), where a policy describes the operations an authenticated client may perform. 

The following `YAML` document provides an example of the :kesconf:`policy` section of the KES server configuration document. 
The policy `minio-sse` includes the appropriate :API endpoints for supporting MinIO Server-Side Encryption:

```yaml {.copy}
policy:
   minio-sse:
      paths:
      - /v1/key/create/*
      - /v1/key/generate/*
      - /v1/key/decrypt/*
      - /v1/key/delete/*
      identities:
      - <SHA-256 HASH>
```

- Each element in the `policy.policyname.paths` array represents an `API endpoint` to which the policy grants access.

- Each element in the `policy.policyname.identities` array represents the SHA-256 hash of an x.509 certificate presented by a client.

  Use the [`kes identity of`]({{< relref "cli/kes-identity/of.md" >}}) command to compute the identity hash of a client's x.509 certificate. 

Policies and identities have a one-to-many relationship, where one policy can contain many identities. 
*However*, a given identity can associate to at most one policy at a time.

The KES server provides two methods for configuring policies:

- The `policy` section of the KES [configuration file]({{< relref "tutorials/configuration.md#config-file" >}}) lists the persistent policies for the KES server.

- The [`kes policy`]({{< relref "cli/kes-policy/_index.md" >}}) command supports creating *ephemeral* policies for the KES server. 
  The [`kes identity`]({{< relref "cli/kes-identity/_index.md" >}}) command supports *ephemeral* modification of the identities associated to policies on the KES server.  

  Policies created or modified using either `kes policy` or `kes identity` disappear after restarting the KES server.

{{< admonition type="note" >}}
Each KES server has its own configuration file from which it derives all persistent policies. 
With distributed KES deployments, each server has its own independent and distinct policy-identity set based on its configuration file. 
This may allow for an identity to associate to different policies depending on which KES server a client connects to.

Exercise caution in allowing KES servers to contain differing policies, as it may result in inconsistent client encryption behavior between servers.
MinIO strongly recommends synchronizing changes to configuration files in distributed KES deployments.
{{< /admonition >}}

***

## Guides
 - [Configuration]({{< relref "/tutorials/configuration.md" >}})
 - [Server API]({{< relref "/concepts/server-api.md" >}})

## Tutorials

 - [MinIO Object Storage]({{< relref "/tutorials/kes-for-minio.md" >}})
 - [TLS Proxies]({{< relref "/concepts/tls-proxy.md" >}})
 - [Logging]({{< relref "/concepts/logging.md" >}})
 - [Monitoring]({{< relref "/concepts/monitoring.md" >}})
 - [Migration]({{< relref "/concepts/kms-migration.md" >}})
 - [Systemd]({{< relref "/tutorials/systemd.md" >}})

## Supported KMS Targets

 - [Hashicorp Vault]({{< relref "/integrations//hashicorp-vault-keystore.md" >}})
 - [Fortanix SDKMS]({{< relref "/integrations/fortanix-sdkms.md" >}})
 - [Thales CipherTrust Manager (formerly Gemalto KeySecure)]({{< relref "/integrations/thales-ciphertrust.md" >}})
 - [AWS Secrets Manager]({{< relref "/integrations/aws-secrets-manager.md" >}})
 - [Google Cloud Secret Manager]({{< relref "/integrations/google-cloud-secret-manager.md" >}})
 - [Azure KeyVault]({{< relref "/integrations/azure-keyvault.md" >}})
 - [Local Filesystem]({{< relref "/tutorials/filesystem-keystore.md" >}})


## External References
### API Documentation

 - [Go SDK API](https://pkg.go.dev/github.com/minio/kes?tab=doc)

### MinIO Blog Posts

 - [Introducing KES - Key Management at Scale](https://blog.min.io/introducing-kes/?rel=kes-docs)