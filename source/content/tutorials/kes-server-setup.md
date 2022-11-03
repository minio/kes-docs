---
title: "Setup a KES Server"
date: 2022-11-01
draft: false
---


1. Generate Private Key & Certificate for the KES Server

   A KES server can only be run with TLS - since secure-by-default. 
   If you already have a TLS private key & certificate, you can use them instead. 
   Remember to adjust the tls config section later on.
   
   For this tutorial, we use self-signed certificates for simplicity.

   The following command generates a private key and a public certificate for a KES server.
   We assume that the KES server has an IP `127.0.0.1` and DNS name `localhost`.
   
   ```sh
   $ kes identity new --ip "127.0.0.1" localhost
   ```

   The output is similar to the following:

   ```sh
   Private key:  private.key
   Certificate:  public.crt
   Identity:     2e897f99a779cf5dd147e58de0fe55a494f546f4dcae8bc9e5426d2b5cd35680
   ```

2. Generate MinIO Credentials
   
   MinIO needs credentials to access the KES server. 
   The following command generates a new TLS private/public key pair:

   ```sh
   kes identity new --key=client.key --cert=client.crt MinIO
   ```
   
   The output is similar to the following:

   ```sh
   Private key:  client.key
   Certificate:  client.crt
   Identity:     02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b
   ```

   The identity `02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b` is a unique fingerprint of the public key in `client.crt`.
   You can re-compute it anytime with the following command:

   ```sh
   kes identity of client.crt
   ```

1. Configure KES Server
   
   Create a new file called `config.yml` and populate it with the the following contents: 

   ```yaml
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
   
   Replace any values in the contents of the value with values appropriate for your instance.
   The `identity` in the `policy` section must match the `client.crt` identity.

2. Start KES Server

   Now, we can start a KES server instance:

   ```shell
   kes server --config config.yml --auth off
   ```

   **Tip:** On Linux systems, you can disable writing to swap to prevent leaking sensitive data using the `mlock syscall`.
      
   The following command allows KES to use the `mlock syscall` on Liux systems without running with `root` privileges:

   ```sh
   sudo setcap cap_ipc_lock=+ep $(readlink -f $(which kes))
   ```

   Start a KES server instance with memory protection:

   ```sh
   $ kes server --config config.yml --auth off --mlock
   ```


# MinIO Server Setup

1. Install MinIO

   Refer to the [MinIO Client Quickstart Guide](https://min.io/docs/minio/linux/reference/minio-mc.html#quickstart).

2. Set `MINIO_KMS_KES_ENDPOINT`

   This environment variable tells MinIO which KES server to talk to.

   ```sh
   export MINIO_KMS_KES_ENDPOINT=https://127.0.0.1:7373
   ```

3. Set MinIO Client Credentials

   MinIO uses the values of these environment variables to access the KES server:

   ```sh
   export MINIO_KMS_KES_CERT_FILE=client.crt
   export MINIO_KMS_KES_KEY_FILE=client.key
   ```

4. Set MinIO Default Key

   MinIO uses the default key if its S3 client does not specify an encryption key.

   ```sh
   export MINIO_KMS_KES_KEY_NAME=minio-default-key
   ```

   **Tip:** MinIO creates this key automatically if it does not exist.

5. Trust the KES Server Certificate

   When using self-signed certificates, MinIO cannot verify the the KES server certificate.
   Therefore, this environment variable tells MinIO to the trust the relationship.

   ```sh
   export MINIO_KMS_KES_CAPATH=public.crt
   ```

   This example assumes `public.crt` is the public certificate of the KES server.
   Replace that value with the name of your public certificate if it is different.

   **Note:** This step is optional if the KES server uses a certificate issued by a trusted Certificate Authority.

6. Start MinIO Server
   
   Set the MinIO root credentials:

   ```sh
   export MINIO_ROOT_USER=minio
   export MINIO_ROOT_PASSWORD=minio123
   ```

   - Replace `minio` with the `root` user name for the MinIO deployment.
   - Replace `minio123` with the password for the `root` user for the MinIO deployment.

   Start MinIO:

   ```sh
   minio server /data
   ```

   - Replace `/data` with the path to the folder to use for this MinIO deployment.

# Encrypt Bucket

You can enable server-side encryption on a specific bucket using the `PutBucketEncryption` S3 API using the MinIO Client. 

1. Create Key
   
   First, create a new key for your bucket. For example:

   ```sh
   mc admin kms key create <alias> minio-my-bucket
   ```

   Replace `<alias>` with the alias for your MinIO deployment.


2. Configure Bucket
   
   The following command adds server-side encryption configuration to your bucket. 

   ```sh
   mc encrypt set sse-kms minio-my-bucket <alias>/my-bucket
   ```

   - Replace `<alias>` with the alias for your MinIO deployment.
   - Replace `my-bucket` with the name of the bucket you are adding encryption to.
