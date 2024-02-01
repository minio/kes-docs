---
title: AWS Secrets Manager
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---
[AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) works as a key-value store for secrets like passwords, access tokens, and cryptographic keys. 
AWS encrypts these secrets with the [AWS Key Management Service](https://aws.amazon.com/kms/) (AWS-KMS).

This tutorial shows how to setup a KES server that uses AWS Secrets Manager as a persistent key store protected by AWS-KMS:

```goat
                    +---------------------------------------------+
 .----------.       |   .----------.      .-------------------.   |
| KES Client +------+--+ KES Server +----+ AWS Secrets-Manager |  |
 '----------'       |   '----------'      '---------+---------'   | 
                    +-------------------------------+-------------+
                                                    |
                                               .----+----.
                                              |  AWS-KMS  |
                                               '---------'
``` 

## AWS Secrets Manager

{{< admonition title="Prerequisite" type="note">}}
You need an [AWS access key and AWS secret key pair](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction_identity-management.html)  with sufficient [IAM policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) permissions to create, retrieve, and delete secrets with AWS Secrets Manager.
{{< /admonition >}}

1. Create AWS Access/Secret Key Pair

   - Go to the [AWS console](https://console.aws.amazon.com/iam/home#/users)
   - Create a new user

     For details on adding a new AWS user, see the [AWS docs](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html).
   - Use the `Programmatic access` type to create a new access key / secret key pair

2. Attach an AWS Policy

   Attach a policy or policies to the new user that grant access to the AWS Secrets Manager and the AWS-KMS.

   Your AWS IAM user needs to have to following permissions:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "Stmt1578498399136",
         "Action": [
           "secretsmanager:CreateSecret",
           "secretsmanager:DeleteSecret",
           "secretsmanager:GetSecretValue",
           "secretsmanager:ListSecrets"
         ],
         "Effect": "Allow",
         "Resource": "*"
       },
       {
         "Sid": "Stmt1578498562539",
         "Action": [
           "kms:Decrypt",
           "kms:DescribeKey",
           "kms:Encrypt"
         ],
         "Effect": "Allow",
         "Resource": "*"
       }
     ]
   }
   ```
   
   {{< admonition type="tip" >}}
   This example policy grants access to all KMS and SecretsManager resources.
   You can restrict access by specifying an [AWS ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) as `Resource` instead of `*`.
   {{< /admonition >}}

   {{< admonition type="note" >}}
   AWS has predefined policies (`SecretsManagerReadWrite` and ` AWSKeyManagementServicePowerUser`).
   However, these grant more permissions than needed. 
   {{< /admonition >}}

## KES Server Setup

1. Generate KES Server Private Key & Certificate

   First, we need to generate a TLS private key and certificate for our KES server.
   A KES server is [secure-by-default](https://en.wikipedia.org/wiki/Secure_by_default) and can only be run with TLS.
   Here we use self-signed certificates for simplicity.

   The following command generates a new TLS private/public key pair and a certificate for the IP address `127.0.0.1` with the DNS name of `localhost`:

   ```sh
   $ kes identity new --ip "127.0.0.1" localhost
   
     Private key:  private.key
     Certificate:  public.crt
     Identity:     2e897f99a779cf5dd147e58de0fe55a494f546f4dcae8bc9e5426d2b5cd35680
   ```
   
   {{< admonition type="tip" >}}
   If you already have a TLS private key & certificate, such as from WebPKI or an internal CA, you can use them instead. 
   Remember to adjust the `tls` config section later on.
   {{< /admonition >}}
 
2. Generate Client Credentials

   Create credentials the client application uses to access the KES server. 
   
   The following command generates a new TLS private/public key pair:

   ```sh
   $ kes identity new --key=client.key --cert=client.crt MyApp
   
     Private key:  client.key
     Certificate:  client.crt
     Identity:     02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b
   ```
   
   {{< admonition type="note" >}}

   The `Identity` is a unique fingerprint of the public key in `client.crt` that you can re-compute at any time:

   ```sh
   $ kes identity of client.crt
   
     Identity:  02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b
   ```
   {{< /admonition >}}

3. Configure KES Server

   Create the KES server [configuration file]({{< relref "/tutorials/configuration.md#config-file" >}}): `config.yml`.
   The identity **must** match what is in the policy section of the  `client.crt` identity.

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
       - /v1/key/create/my-key*
       - /v1/key/generate/my-key*
       - /v1/key/decrypt/my-key*
       identities:
       - 02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b # Use the identity of your client.crt
      
   keystore:
        aws:
          secretsmanager:
            endpoint: secretsmanager.us-east-2.amazonaws.com  # Use the SecretsManager in your region.
            region:   us-east-2                               # Use your region
            kmskey:   ""                                      # Your AWS-KMS master key (CMK) - optional.
            credentials:
              accesskey: "" # Your AWS Access Key
              secretkey: "" # Your AWS Secret Key
   ```

4. Start KES Server
   {{< tabs "AWS Initialization" >}}
   {{< tab "Linux" >}} 

   ```
   $ kes server --config config.yml --auth off
   ```
   
   {{< admonition title="Linux Swap Protection" type="tip" >}}

   In Linux environments, KES can use the [`mlock`](http://man7.org/linux/man-pages/man2/mlock.2.html) syscall to prevent the OS from writing in-memory data to disk (swapping). 
   This prevents leaking sensitive data.
   
   Use the following command to allow KES to use the mlock syscall without running with `root` privileges:

   ```sh {.copy}
   sudo setcap cap_ipc_lock=+ep $(readlink -f $(which kes))
   ```

   Start a KES server instance with memory protection:
   
   ```sh {.copy}
   kes server --config config.yml --auth off --mlock
   ```
   {{< /admonition >}}

   {{ /tab }}

   {{< tab "Container" >}}

   The instructions use [Podman](https://podman.io/) to manage the containers.
   You can accomplish similar with Docker, if preferred.

   Modify addresses and file paths as needed for your deployment.
   
   ```sh {.copy}
   sudo podman pod create  \
     -p 9000:9000 -p 9001:9001 -p 7373:7373  \
     -v ~/minio-kes-aws/certs:/certs  \
     -v ~/minio-kes-aws/minio:/mnt/minio  \
     -v ~/minio-kes-aws/config:/etc/default/  \
     -n minio-kes-aws
   
   sudo podman run -dt  \
     --cap-add IPC_LOCK  \
     --name kes-server  \
     --pod "minio-kes-aws"  \
     -e KES_SERVER=https://127.0.0.1:7373  \
     -e KES_CLIENT_KEY=/certs/kes-server.key  \
     -e KES_CLIENT_CERT=/certs/kes-server.cert  \
     quay.io/minio/kes:2024-01-11T13-09-29Z server  \
       --auth  \
       --config=/etc/default/kes-config.yaml  \
   
   sudo podman run -dt  \
     --name minio-server  \
     --pod "minio-kes-aws"  \
     -e "MINIO_CONFIG_ENV_FILE=/etc/default/minio"  \
     quay.io/minio/minio:RELEASE.2024-01-31T20-20-33Z server  \
       --console-address ":9001"
   ```

   You can verify the status of the containers using the following command.
   The command should show three pods, one for hte Pod, one for KES, and one for MinIO.

   ```sh {.copy}
   sudo podman container list
   ```

   {{< /tab >}}
   
   {{< /tabs >}}


## KES CLI Access

1. Set `KES_SERVER` Endpoint

   This environment variable tells the KES CLI which server it should talk to.

   ```sh
   $ export KES_SERVER=https://127.0.0.1:7373
   ```

2. Use Client Credentials

   The following environment variables set the access credentials the KES CLI uses to talk to a KES server.

   ```sh
   $ export KES_CLIENT_CERT=client.crt
   ```
   ```sh
   $ export KES_CLIENT_KEY=client.key
   ```

3. Test access

   Perform any API operation that is allowed based on the policy we assigned above. 
   
   For example, to create a key:
   ```sh
   $ kes key create my-key-1
   ```
   
   Use the key to generate a new data encryption key:

   ```sh
   $ kes key dek my-key-1
   {
     plaintext : UGgcVBgyQYwxKzve7UJNV5x8aTiPJFoR+s828reNjh0=
     ciphertext: eyJhZWFkIjoiQUVTLTI1Ni1HQ00tSE1BQy1TSEEtMjU2IiwiaWQiOiIxMTc1ZjJjNDMyMjNjNjNmNjY1MDk5ZDExNmU3Yzc4NCIsIml2IjoiVHBtbHpWTDh5a2t4VVREV1RSTU5Tdz09Iiwibm9uY2UiOiJkeGl0R3A3bFB6S21rTE5HIiwiYnl0ZXMiOiJaaWdobEZrTUFuVVBWSG0wZDhSYUNBY3pnRWRsQzJqWFhCK1YxaWl2MXdnYjhBRytuTWx0Y3BGK0RtV1VoNkZaIn0=
   }
   ```

## Using KES with a MinIO Server

MinIO Server requires KES to set up server-side data encryption.

See the [KES for MinIO instruction guide]({{< relref "/tutorials/kes-for-minio.md" >}}) for additional steps needed to use your new KES Server with a MinIO Server.


## Configuration References

The following section describes each of the Key Encryption Service (KES) configuration settings for using AWS Secrets Manager and AWS Key Management System as the root KMS for Server Side Encryption with KES.

{{< admonition title="MinIO Server Requires Expanded Permissions" type="important" >}}
Starting with [MinIO Server RELEASE.2023-02-17T17-52-43Z](https://github.com/minio/minio/releases/tag/RELEASE.2023-02-17T17-52-43Z), MinIO requires expanded KES permissions for functionality. 
The example configuration in this section contains all required permissions.
{{< /admonition >}}


{{< tabs "aws-config" >}}
{{< tab "YAML Overview" >}}
Fields with `${<STRING>}` use the environment variable matching the `<STRING>` value. 
You can use this functionality to set credentials without writing them to the configuration file.

The YAML assumes a minimal set of permissions for the MinIO deployment accessing KES. 
As an alternative, you can omit the `policy.minio-server` section and instead set the `${MINIO_IDENTITY}` hash as the `${ROOT_IDENTITY}`.

```yaml {.copy}
address: 0.0.0.0:7373
root: ${ROOT_IDENTITY}

tls:
  key: kes-server.key
  cert: kes-server.cert

api:
  /v1/ready:
    skip_auth: false
    timeout:   15s

policy:
  minio-server:
    allow:
    - /v1/key/create/*
    - /v1/key/generate/*
    - /v1/key/decrypt/*
    - /v1/key/bulk/decrypt
    - /v1/key/list/*
    - /v1/status
    - /v1/metrics
    - /v1/log/audit
    - /v1/log/error
    deny:
    - /v1/key/generate/my-app-internal*
    - /v1/key/decrypt/my-app-internal*
    identities:
    - ${MINIO_IDENTITY}

    my-app:
    allow:
    - /v1/key/create/my-app*
    - /v1/key/generate/my-app*
    - /v1/key/decrypt/my-app*
    deny:
    - /v1/key/generate/my-app-internal*
    - /v1/key/decrypt/my-app-internal*
    identities:
    - df7281ca3fed4ef7d06297eb7cb9d590a4edc863b4425f4762bb2afaebfd3258
    - c0ecd5962eaf937422268b80a93dde4786dc9783fb2480ddea0f3e5fe471a731

keys:
  - name: "minio-encryption-key-alpha"
  - name: "minio-encryption-key-baker"
  - name: "minio-encryption-key-charlie"

cache:
  expiry:
    any: 5m0s
    unused: 20s
    offline: 0s

# The following log configuration only affects logging to console.
log:

  # Enable/Disable logging error events to STDERR. Valid values
  # are "on" or "off". If not set the default is "on". If no error
  # events should be logged to STDERR it has to be set explicitly
  # to: "off".
  error: on

  # Enable/Disable logging audit events to STDOUT. Valid values
  # are "on" and "off". If not set the default is "off".
  # Logging audit events to STDOUT may flood your console since
  # there will be one audit log event per request-response pair.
  audit: off

keystore:
  aws:
    # The AWS SecretsManager key store. The server will store
    # secret keys at the AWS SecretsManager encrypted with
    # AWS-KMS. See: https://aws.amazon.com/secrets-manager
    secretsmanager:
      endpoint: secretsmanager.REGION.amazonaws   # The AWS SecretsManager endpoint      - e.g.: secretsmanager.us-east-2.amazonaws.com
      region: REGION     # The AWS region of the SecretsManager - e.g.: us-east-2
      kmskey: ""     # The AWS-KMS key ID used to en/decrypt secrets at the SecretsManager. By default (if not set) the default AWS-KMS key will be used.
      credentials:   # The AWS credentials for accessing secrets at the AWS SecretsManager.
        accesskey: "${AWS_ACCESS_KEY}"  # Your AWS Access Key
        secretkey: "${AWS_SECRET_KEY}"  # Your AWS Secret Key
        token: ""      # Your AWS session token (usually optional)
```

{{< /tab >}}

{{< tab "Reference" >}}

For complete documentation, see the [configuration page]({{< relref "/tutorials/configuration.md" >}}).

| <div style="width:150px"> Key  </div>                        | Description                    |
|-----------------------------|--------------------------------|
| `address`                     | The network address and port the KES server listens to on startup. Defaults to port `7373` on all host network interfaces. |
| `root`                        | The identity for the KES superuser (`root`) identity. Clients connecting with a TLS certificate whose hash (`kes identity of client.cert`) matches this value have access to all KES API operations. Specify `disabled` to remove the root identity and rely only on the `policy` configuration for controlling identity and access management to KES. |
| `tls`                         | The TLS private key and certificate used by KES for establishing TLS-secured communications. Specify the full path for both the private `.key` and public `.cert` to the `key` and `cert` fields, respectively. |
| `policy`                      | Specify one or more [policies]({{< relref "/tutorials/configuration.md#policy-configuration" >}}) to control access to the KES server. MinIO SSE requires access to the following KES cryptographic APIs: <br><br> `/v1/key/create/*` <br> `/v1/key/generate/*` <br> `/v1/key/decrypt/*` <br><br> Specifying additional keys does not expand MinIO SSE functionality and may violate security best practices around providing unnecessary client access to cryptographic key operations. <br><br> You can restrict the range of key names MinIO can create as part of performing SSE by specifying a prefix before the `*.` For example, `minio-sse-*` only grants access to `create`, `generate`, or `decrypt` keys using the `minio-sse-` prefix. <br><br>KES uses mTLS to authorize connecting clients by comparing the hash of the TLS certificate against the `identities` of each configured policy. Use the `kes identity of` command to compute the identity of the MinIO mTLS certificate and add it to the `policy.<NAME>.identities` array to associate MinIO to the `<NAME>` policy. |
| `keys`                        | Specify an array of keys which *must* exist on the root KMS for KES to successfully start. KES attempts to create the keys if they do not exist and exits with an error if it fails to create any key. KES does not accept any client requests until it completes validation of all specified keys.|
| `cache`                       | Specify expiration of cached keys in `#d#h#m#s` format. Unexpired keys may be used in the event the KMS becomes temporarily unavailable. <br><br> Entries may be set for `any` key, `unused` keys, or `offline` keys. <br><br> If not set, KES uses values of `5m` for all keys, `20s` for unused keys, and `0s` for offline keys. |
| `log`                         | Enable or disable output for `error` and `audit` type logging events to the console. |
| `keystore.aws.secretsmanager` | Use this section of values to configure the AWS Secrets Manager and AWS KMS. |
| `keystore.aws.secretsmanager.endpoint` | The endpoint for the Secrets Manager service, including the region. |
| `keystore.aws.secretsmanager.region` | The AWS region to use for other AWS services. |
| `keystore.aws.secretsmanager.kmskey` | The root KMS Key to use for cryptographic operations. Formerly known as the Customer Master Key. |
| `keystore.aws.secretsmanager.credentials` | The AWS Credentials to use for performing authenticated operations against Secrets Manager and KMS. The specified credentials *must* have the [appropriate permissions](https://min.io/docs/minio/container/operations/server-side-encryption/configure-minio-kes-aws.html#minio-sse-aws-prereq-aws?ref=kes-docs). <br><br> Make entries for both `accesskey` and `secretkey` or an entry for `token`. |
{{< /tab >}}
{{< /tabs >}}
