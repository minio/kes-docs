---
title: MinIO Key Encryption Service
date: 2022-11-01
draft: false
---

# Overview

The **MinIO Key Encryption Service (KES)** is a stateless and distributed key management system (KMS) for high performance applications.
Use KES as a bridge between modern applications—running as containers on [Kubernetes](https://kubernetes.i0)—and centralized KMS solutions.

Primary KES features includes:

- Simple
- Scalable
- Secure

Manage KES with a few configuration options that do no require a deep understanding of either secure key management or cryptography more broadly.




# Table of Contents

- [How KES Works]({{< ref "/concepts/how-kes-works.md" >}})
- [KES Server Reference]({{< ref "/reference/kes-server.md" >}})
- Tutorials
  - [Configuring KES on a Hashicorp Vault]({{< ref "/tutorials/configure-kes-with-hashicorp-vault.md" >}})
  - [Install KES]({{< ref "/tutorials/install-kes.md" >}})
  - [Test KES]({{< ref "/tutorials/test-kes.md" >}})