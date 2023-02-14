---
title: MinIO Key Encryption Service
date: 2022-11-01
draft: false
---

Welcome to the KES wiki! Here, you can find information about [MinIO](https://min.io)'s KES project - including architecture and configuration guides, best practices and general documentation.

### Why KES

KES is a stateless and distributed key-management system for high-performance applications. We built KES as the 
bridge between modern applications - running as containers on [Kubernetes](https://kubernetes.io) - and
centralized KMS solutions. Therefore, KES has been designed to be simple, scalable and secure by default. It has
just a few knobs to tweak instead of a complex configuration and does not require a deep understanding of secure
key-management or cryptography.

If you're new to KES you may want to checkout our [Get Started Guide](https://github.com/minio/kes/wiki/Getting-Started), our [Configuration](https://github.com/minio/kes/wiki/Configuration) guide or read more about how KES
works at our [Concepts](https://github.com/minio/kes/wiki/Concepts) page.

***

## Guides
 - **[Configuration](https://github.com/minio/kes/wiki/Configuration)**

## Supported KMS Targets
 - **[Hashicorp Vault](https://github.com/minio/kes/wiki/Hashicorp-Vault-Keystore)**
 - **[Fortanix SDKMS](https://github.com/minio/kes/wiki/Fortanix-SDKMS)**
 - **[Thales CipherTrust Manager / Gemalto KeySecure](https://github.com/minio/kes/wiki/Gemalto-KeySecure)**
 - **[AWS SecretsManager](https://github.com/minio/kes/wiki/AWS-SecretsManager)**
 - **[GCP SecretManager](https://github.com/minio/kes/wiki/GCP-SecretManager)**
 - **[Azure KeyVault](https://github.com/minio/kes/wiki/Azure-KeyVault)**
 - **[Filesystem](https://github.com/minio/kes/wiki/Filesystem-Keystore)**

## API Documentation

 - **[Server API](https://github.com/minio/kes/wiki/Server-API)**
 - **[Go SDK API](https://pkg.go.dev/github.com/minio/kes?tab=doc)**

## Miscellaneous

 - **[MinIO Object Storage](https://github.com/minio/kes/wiki/MinIO-Object-Storage)**
 - **[TLS Proxies](https://github.com/minio/kes/wiki/TLS-Proxy)**
 - **[Logging](https://github.com/minio/kes/wiki/Logging)**
 - **[Monitoring](https://github.com/minio/kes/wiki/Monitoring)**
 - **[Migration](https://github.com/minio/kes/wiki/KMS-Migration)**
 - **[Systemd](https://github.com/minio/kes/wiki/Systemd)**

## Blog Posts

 - **[Introducing KES - Key Management at Scale](https://blog.min.io/introducing-kes/)**