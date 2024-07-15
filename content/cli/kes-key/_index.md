---
title: kes key
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

The :mc:`kes key` command creates, utilizes, displays, and deletes cryptographic keys (Secrets) through the MinIO Key Encryption Service (KES). 
KES stores created secrets on the configured [Key Management System (KMS)]({{< relref "/_index.md#supported-kms-targets" >}}) target.

You can also use these commands to encrypt/decrypt messages or generate new data encryption keys.

This set of pages provides reference information for the `kes key` commands. 
## Subcommands

|Subcommands                                        |Description                                  |
|:--------------------------------------------------|:--------------------------------------------|
|[`create`]({{< relref "/cli/kes-key/create" >}})   |Create a new cryptographic key               |
|[`import`]({{< relref "/cli/kes-key/import" >}})   |Import a cryptographic key                   |
|[`info`]({{< relref "/cli/kes-key/info" >}})       |Output information about a cryptographic key |
|[`rm`]({{< relref "/cli/kes-key/rm" >}})           |Delete a cryptographic key                   |
|                                                   |                                             |
|[`encrypt`]({{< relref "/cli/kes-key/encrypt" >}}) |Encrypt a message                            |
|[`decrypt`]({{< relref "/cli/kes-key/decrypt" >}}) |Decrypt an encrypted message                 |
|[`dek`]({{< relref "/cli/kes-key/dek" >}})         |Generate a new data encryption key           |

## Deprecated

|Subcommands                                        |Description                                   |
|:--------------------------------------------------|:---------------------------------------------|
|[`ls`]({{< relref "/cli/deprecated/key-ls" >}})    |Use [`kes ls`]({{< relref "/cli/kes-ls/" >}}) |
