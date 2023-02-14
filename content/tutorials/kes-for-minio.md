---
title: KES on a MinIO Deployment
date: 2023-02-08
draft: false
---

This guide shows how to setup a KES server and then configure a [MinIO server](https://github.com/minio/minio) as KES client for object encryption.

```
╔═══════════════════════════════════════╗ 
║ ┌───────────┐          ┌────────────┐ ║        ┌─────────┐
║ │   MinIO   ├──────────┤ KES Server ├─╫────────┤   KMS   │
║ └───────────┘          └────────────┘ ║        └─────────┘
╚═══════════════════════════════════════╝
```

> Here, we focus on a simple KES server setup. Therefore, we use the local filesystem as key store and omit the
> KMS integration. However, you can of course choose any supported KMS implementation that meets your
> requirements.

***

### KES Server Setup

<details open="true"><summary><b>1. Generate KES Server Private Key & Certificate</b></summary>

First, we need to generate a TLS private key and certificate for our KES server.
A KES server can only be run with TLS - since [secure-by-default](https://en.wikipedia.org/wiki/Secure_by_default).
Here we use self-signed certificates for simplicity.

The following command generates a new TLS private key (`private.key`) and
a self-signed X.509 certificate (`public.crt`) issued for the IP `127.0.0.1`
and DNS name `localhost`: 

```sh
$ kes identity new --ip "127.0.0.1" localhost

  Private key:  private.key
  Certificate:  public.crt
  Identity:     2e897f99a779cf5dd147e58de0fe55a494f546f4dcae8bc9e5426d2b5cd35680
```

> If you already have a TLS private key & certificate - e.g. from a WebPKI or internal
> CA - you can use them instead. Remember to adjust the `tls` config section later on.
 
</details>

<details><summary><b>2. Generate MinIO Credentials</b></summary>

MinIO needs some credentials to access the KES server. The following
command generates a new TLS private/public key pair:
```sh
$ kes identity new --key=client.key --cert=client.crt MinIO

  Private key:  client.key
  Certificate:  client.crt
  Identity:     02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b
```

The identity `02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b`
is an unique fingerprint of the public key in `client.crt` and you can re-compute
it anytime:
```sh
$ kes identity of client.crt

  Identity:  02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b
```

</details>

<details><summary><b>3. Configure KES Server</b></summary>

Next, we can create the KES server configuration file: `config.yml`.
Please, make sure that the identity in the policy section matches
your `client.crt` identity.

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

</details>

<details><summary><b>4. Start KES Server</b></summary>

Now, we can start a KES server instance:
```
$ kes server --config config.yml --auth off
```

> On linux, KES can use the [`mlock`](http://man7.org/linux/man-pages/man2/mlock.2.html) syscall
> to prevent the OS from writing in-memory data to disk (swapping). This prevents leaking senstive
> data accidentality. The following command allows KES to use the mlock syscall without running
> with root privileges:
> ```sh
> $ sudo setcap cap_ipc_lock=+ep $(readlink -f $(which kes))
> ```
> Then, we can start a KES server instance with memory protection:
> ```
> $ kes server --config config.yml --auth off --mlock
> ```

</details>

### MinIO Server Setup

<details><summary><b>1. Install MinIO</b></summary>

You can either download a [static binary](https://min.io/download) or follow the [MinIO Quickstart Guide](https://github.com/minio/minio#minio-quickstart-guide).

</details>

<details><summary><b>2. Set <code>MINIO_KMS_KES_ENDPOINT</code></b></summary>

MinIO needs to know to which KES server it should talk to:
```sh
export MINIO_KMS_KES_ENDPOINT=https://127.0.0.1:7373
```

</details>

<details><summary><b>3. Set MinIO Client Credentials</b></summary>

Further, MinIO needs some access credentials to talk to a KES server:
```sh
export MINIO_KMS_KES_CERT_FILE=client.crt
```

```sh
export MINIO_KMS_KES_KEY_FILE=client.key
```

</details>

<details><summary><b>4. Set MinIO Default Key</b></summary>

MinIO needs a default key that it will use if its S3 client does
not specify an encryption key.
```sh
export MINIO_KMS_KES_KEY_NAME=minio-default-key
```
> MinIO will create this key automatically if it doesn't exist.

</details>

<details><summary><b>5. Trust the KES Server Certificate</b></summary>

When using self-signed certificates, MinIO cannot verify the the KES
server certificate. Therefore, we establish the trust relationship
manually. 
```sh
export MINIO_KMS_KES_CAPATH=public.crt
```
> Here, `public.crt` is the public certificate of the KES server.  
> This step is optional if the KES server uses a certificate
issued by a trusted CA.

</details>

<details><summary><b>6. Start MinIO Server</b></summary>

First, set the MinIO root credentials:
```sh
export MINIO_ROOT_USER=minio
export MINIO_ROOT_PASSWORD=minio123
```

Then, start MinIO:
```sh
minio server /data
```

</details>

### Encrypt Bucket

You can enable server-side encryption on a specific bucket using the
[`PutBucketEncryption`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketEncryption.html) S3 API.
This can be done quite easily with [`mc`](https://github.com/minio/mc/#minio-client-quickstart-guide).

<details><summary><b>1. Create Key</b></summary>

First, create a new key for your bucket. For example:
```sh
mc admin kms key create <alias> minio-my-bucket
```
> Use your MinIO server alias.

</details>


<details><summary><b>2. Configure Bucket</b></summary>

Then, add a server-side encryption configuration to your bucket. For example:
```sh
mc encrypt set sse-kms minio-my-bucket <alias>/my-bucket
```
> Use your MinIO server alias.

</details>

### References

 - [**MinIO Encryption**](https://docs.min.io/minio/baremetal/security/encryption-overview.html)
 - [**Server API Doc**](https://github.com/minio/kes/wiki/Server-API)
 - [**Go SDK Doc**](https://pkg.go.dev/github.com/minio/kes)