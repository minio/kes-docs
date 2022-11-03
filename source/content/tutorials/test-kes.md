---
title: "Test KES"
date: 2022-11-01
draft: false
---


You can use the CLI, Server, or cURL to get started with KES.

The instructions below allow you to interact with our public KES server instance at https://play.min.io:7373.
Instructions are provided to use the CLI, server, or cURL.

## Prerequisites

You have [installed KES]({{< ref "/tutorials/install-kes.md" >}}).

## CLI

1. Fetch Admin Credentials
   
   Download the `private` key and certificate to authenticate to the KES server as the root identity.

   ```sh
   curl -sSL --tlsv1.2 \
      -O 'https://raw.githubusercontent.com/minio/kes/master/root.key' \
      -O 'https://raw.githubusercontent.com/minio/kes/master/root.cert'
   ```
   
2. Configure the CLI

   Point the KES CLI to the KES server at `https://play.min.io:7373` and use the `root.key` and `root.cert` as authentication credentials.

   ```sh
   export KES_SERVER=https://play.min.io:7373
   export KES_CLIENT_KEY=root.key
   export KES_CLIENT_CERT=root.cert
   ```

3. Create a Key

   Create a new master key.
   The following example command creates a new master key called `my-key`.
   
   ```
   kes key create my-key
   ```
   
   > **Note:** Creating a new key will fail with `key already exist` if a key with that name already exists.

4. Generate a DEK

   Now, you can use that master key to derive a new data encryption key (DEK).
   ```sh
   kes key dek my-key
   ```
   
   You will get a plaintext and a ciphertext data key. 
   The ciphertext data key is the encrypted version of the plaintext key. 
   Your application would use the plaintext key to, for example, encrypt some application data but only remember the ciphertext key version.

5. Further References
   
   For more KES CLI commands run `kes --help`. For example, you can list all master
   keys at the KES server:
   ```sh
   kes key ls
   ```
   
## Server

For a quickstart setup take a look at our [FS guide](https://github.com/minio/kes/wiki/Filesystem-Keystore).

For further references checkout our list of key store [guides](https://github.com/minio/kes/wiki#guides).
   
## cURL

1. Fetch Admin Credentials

   As an initial step, you will need to download the "private" key and certificate to authenticate to the KES server as the root identity.
   
   ```sh
   curl -sSL --tlsv1.2 \
      -O 'https://raw.githubusercontent.com/minio/kes/master/root.key' \
      -O 'https://raw.githubusercontent.com/minio/kes/master/root.cert'
   ```
   
2. Create a Key   
  
   Then, you can create a new master key e.g. `my-key`.
   ```sh
   curl -sSL --tlsv1.3 \
       --key root.key \
       --cert root.cert \
       -X POST 'https://play.min.io:7373/v1/key/create/my-key'
   ```

   > Note that creating a new key will fail with `key already exist` if it already exist.

3. Generate a DEK

   Now, you can use that master key to derive a new data encryption key (DEK).

   ```sh
   curl -sSL --tlsv1.3 \
       --key root.key \
       --cert root.cert \
       --data '{}' \
       -X POST 'https://play.min.io:7373/v1/key/generate/my-key'
   ```
   
   You will get a plaintext and a ciphertext data key. 
   The ciphertext data key is the encrypted version of the plaintext key. 
   
   For examle, your application might use the plaintext key to encrypt some application data but only remember the ciphertext key version.

4. Further References
   
   For a comprehensive list of REST API endpoints refer to the KES [API overview](https://github.com/minio/kes/wiki/Server-API).