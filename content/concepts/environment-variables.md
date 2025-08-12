---
title: KES Environment Variables
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---

This page contains a list of the environment variables available for configuring the MinIO Key Encryption Service.

## `MINIO_KMS_KES_ENDPOINT`

The endpoint for the MinIO Key Encryption Service (KES) process to use for supporting SSE-S3 and MinIO backend encryption operations.
By default, KES binds to port `7373` on all network interfaces.

## `MINIO_KMS_KES_KEY_FILE`

The private key associated to the the `MINIO_KMS_KES_CERT_FILE` x.509 certificate to use when authenticating to the KES server. 
The KES server requires clients to present their certificate for performing mutual TLS (mTLS).

## `MINIO_KMS_KES_CERT_FILE`

The x.509 certificate to present to the KES server. 
The KES server requires clients to present their certificate for performing mutual TLS (mTLS).

The KES server computes an identity from the certificate and compares it to its configured policies. 
The KES server grants the MinIO server access to only those operations explicitly granted by the policy.

## `MINIO_KMS_KES_KEY_NAME`

The name of an external key on the Key Management system (KMS) configured on the KES server and used for performing en/decryption operations. 
MinIO uses this key for the following:

- Encrypting backend data ([IAM](https://docs.min.io/community/minio-object-store/administration/identity-access-management.html), server configuration).
- The default encryption key for Server-Side Encryption with [SSE-KMS](https://docs.min.io/community/minio-object-store/administration/server-side-encryption/server-side-encryption-sse-kms.html#minio-encryption-sse-kms).
- The encryption key for Server-Side Encryption with [SSE-S3](https://docs.min.io/community/minio-object-store/administration/server-side-encryption/server-side-encryption-sse-s3.html#minio-encryption-sse-s3).

## `MINIO_KES_SERVER`

The server endpoint a client uses to connect to KES.
If not defined, the value defaults to `127.0.0.1:7373`.


## `MINIO_KES_API_KEY`

The API key a client uses to authenticate to the KES server.