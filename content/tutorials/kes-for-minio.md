---
title: KES on a MinIO Deployment
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
weight: 20
---

This tutorial shows how to setup a KES server and then configure a [MinIO deployment](https://docs.min.io/community/minio-object-store/index.html) as a KES client for object encryption.

```goat
+--------------------------------+ 
|  .---------.     .----------.  |    .-------.
| |   MinIO   +---+ KES Server +-+---+   KMS   |
|  '---------'     '----------'  |    '-------'
+--------------------------------+
```

{{< admonition title="For testing only" type="note" >}}
This tutorial focuses on a simple KES server setup. 
We use the local filesystem as key store and omit the KMS integration. 

For production use, choose any supported KMS implementation that meets your requirements.
{{< /admonition >}}

## KES Server Setup

1. Generate KES Server Private Key & Certificate

   Generate a TLS private key and certificate for the KES server.
   This key is used for domain name verification for the server address.

   A KES server is [secure-by-default](https://en.wikipedia.org/wiki/Secure_by_default) and can only be run with TLS.
   In this guide, we use self-signed certificates for simplicity.
   
   The following command generates a new TLS private key (`private.key`) and a self-signed X.509 certificate (`public.crt`) issued for the IP `127.0.0.1` and DNS name `localhost`: 
   
   ```sh
   $ kes identity new --ip "127.0.0.1" localhost
   
     Private key:  private.key
     Certificate:  public.crt
     Identity:     2e897f99a779cf5dd147e58de0fe55a494f546f4dcae8bc9e5426d2b5cd35680
   ```
   
   {{< admonition title="Existing Key & Certificate" type="note" >}}
   If you already have a TLS private key & certificate, such as from a WebPKI or internal Certificate Authority, you can use them instead. 
   Remember to adjust the `tls` config section.
   {{< /admonition >}}

2. Generate MinIO Credentials

   MinIO needs credentials to access the KES server. 
   The following command generates a hashed identity from a provided TLS private/public key pair:
   
   ```sh
   $ kes identity new --key=client.key --cert=client.crt MinIO
   
     Private key:  client.key
     Certificate:  client.crt
     Identity:     02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b
   ```
   
   The identity `02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b` is a unique fingerprint of the public key in `client.crt`.
   Use this API key identity to validate the MinIO client to the KES server.

   You can re-compute the identity from the same certificate at any time:
   
   ```sh
   $ kes identity of client.crt
   
     Identity:  02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b
   ```

3. Configure KES Server
   
   This procedure provides a baseline set of steps that may require significant alteration to fit your goals.
   For detailed instructions on configuring the KES Server for a specific Key Management System provider, see the integration page for [supported targets]({{< relref "_index.md#supported-kms-targets" >}}).

   Create the KES server configuration file: `config.yml`.
   Ensure the identity in the `policy` section matches your `client.crt` identity.

   ```yaml {.copy}
   address: 0.0.0.0:7373 # Listen on all network interfaces on port 7373
   
   admin:
     identity: disabled  # We disable the admin identity since we don't need it in this guide 
      
   tls:
     key: private.key    # The KES server TLS private key
     cert: public.crt    # The KES server TLS certificate
      
   policy:
     my-app: 
       allow:
       - /v1/key/create/minio-*
       - /v1/key/generate/minio-*
       - /v1/key/decrypt/minio-*
       identities:
       - 02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b # Use the identity of your client.crt
      
   keystore:
     fs:
       path: ./keys # Choose a directory for the secret keys
   ```

4. Start KES Server

   ```sh  {.copy}
   kes server --config config.yml --auth off
   ```
   
   {{< admonition title="Linux Swap Protection" type="tip" >}}

   In Linux environments, KES can use the [`mlock`](http://man7.org/linux/man-pages/man2/mlock.2.html) syscall to prevent the OS from writing in-memory data to disk (swapping). 
   This prevents leaking sensitive data.
   
   Use the following command to allow KES to use the `mlock` syscall without running with `root` privileges:

   ```sh {.copy}
   sudo setcap cap_ipc_lock=+ep $(readlink -f $(which kes))
   ```

   Start a KES server instance with memory protection:
   
   ``` {.copy}
   kes server --config config.yml --auth off --mlock
   ```
   {{< /admonition >}}

## MinIO Server Setup

The environment variables defined in steps 2-6 below can be defined as part of the MinIO Server [environment variable file](https://docs.min.io/community/minio-object-store/operations/deployments/baremetal-deploy-minio-on-redhat-linux.html#review-the-systemd-service-file?ref=kes-docs).

1. Install MinIO

   You can either download a [static binary](https://min.io/download) or follow the [MinIO Quickstart Guide](https://docs.min.io/community/minio-object-store/operations/deployments/baremetal-deploy-minio-server.html).

   For more detailed instructions on setting up a MinIO Server on other topologies, such as with multiple drives or multiple nodes, see the [installation documentation](https://docs.min.io/community/minio-object-store/operations/deployments/baremetal-deploy-minio-on-ubuntu-linux.html?ref=kes-docs).

   Select the tab for your operating system for an OS-specific quickstart.

2. Set `MINIO_KMS_KES_ENDPOINT`

   This environment variable tells MinIO which KES server to access:
   
   ```sh {.copy}
   export MINIO_KMS_KES_ENDPOINT=https://127.0.0.1:7373
   ```

3. Set MinIO Client Credentials

   These environment variables set the access credentials MinIO uses to access the KES server:
   
   ```sh {.copy}
   export MINIO_KMS_KES_CERT_FILE=client.crt
   ```
   
   ```sh {.copy}
   export MINIO_KMS_KES_KEY_FILE=client.key
   ```

4. Set MinIO Default Key

   This environment variable sets the default key for MinIO to use if its S3 client does not specify an encryption key.

   ```sh {.copy}
   export MINIO_KMS_KES_KEY_NAME=minio-default-key
   ```
   
   {{< admonition type="note" >}}
   MinIO creates this key automatically if it does not exist.
   {{< /admonition >}}

5. Trust the KES Server Certificate
 
   *This step is optional if the KES server uses a certificate issued by a trusted Certificate Authority.*

   When using self-signed certificates, MinIO cannot verify the the KES server certificate. 
   This environment variable establishes the trust relationship manually. 
   
   ```sh {.copy}
   export MINIO_KMS_KES_CAPATH=public.crt
   ```
   
   In this case, `public.crt` is the public certificate of the KES server.  

6. Set the MinIO root credentials:

   ```sh {.copy}
   export MINIO_ROOT_USER=minio
   export MINIO_ROOT_PASSWORD=minio123
   ```

7. Start the MinIO Server
   
   {{< admonition type="important" >}}
   The KES server **must** be running *before* you start the MinIO Server.
   The MinIO Server requires access to the KES server as part of the start-up process.
   {{< /admonition >}}    

   ```sh {.copy}
   minio server /data
   ```

## Encrypt Bucket

Enable server-side encryption on a specific bucket using the [`PutBucketEncryption`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketEncryption.html) S3 API.
This can be done with the [MinIO Client](https://docs.min.io/community/minio-object-store/reference/minio-mc.html).

1. Create Key

   For a full reference, see the [`mc admin kms key` documentation](https://docs.min.io/community/minio-object-store/reference/minio-mc-admin/mc-admin-kms-key.html).

   ```sh {.copy}
   mc admin kms key create <alias> minio-key-name
   ```

   Replace `minio-key-name` with the name to use for your key.

2. Configure Bucket

   Add a server-side encryption configuration to your bucket with [`mc encrypt set`](https://docs.min.io/community/minio-object-store/reference/minio-mc/mc-encrypt-set.html). 
   
   For example:

   ```sh {.copy}
   mc encrypt set sse-kms minio-key-name <alias>/my-bucket
   ```
   
   Replace `minio-key-name` with the name of the key you created in the previous step.

## References

- [MinIO Encryption](https://docs.min.io/community/minio-object-store/operations/server-side-encryption.html)
- [Server API Doc]({{< relref "server-api" >}})
- [Go SDK Doc](https://pkg.go.dev/github.com/minio/kes)