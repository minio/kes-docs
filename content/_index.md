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