---
title: AWS Secrets Manager
date: 2023-02-08
draft: false
---



This guide shows how to setup a KES server that uses AWS SecretsManager as a persistent key store protected by the AWS-KMS:

```
                         ╔═══════════════════════════════════════════════════╗
┌────────────┐           ║  ┌────────────┐          ┌─────────────────────┐  ║
│ KES Client ├───────────╫──┤ KES Server ├──────────┤ AWS Secrets-Manager │  ║
└────────────┘           ║  └────────────┘          └──────────┬──────────┘  ║
                         ╚═════════════════════════════════════╪═════════════╝
                                                               |
                                                         ┌─────┴─────┐
                                                         |  AWS-KMS  |
                                                         └───────────┘
``` 

***

### AWS SecretsManager

The [AWS SecretsManager](https://aws.amazon.com/secrets-manager/) is basically a key-value store for secrets - like passwords, access tokens and cryptographic keys. AWS will encrypt these secrets via their [AWS-KMS](https://aws.amazon.com/kms/) service.

<details><summary><b>1. Create AWS Access/Secret KeyPair</b></summary>

To create, retrieve and delete secrets at/from the AWS SecretsManager you need an [AWS IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction_identity-management.html) - i.e. an AWS access key and AWS secret key pair with sufficient [IAM policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) permissions.

Go to the [AWS console](https://console.aws.amazon.com/iam/home#/users) and create a new user.
Use the `Programmatic access` type to create a new access key / secret key pair.

</details>

<details><summary><b>2. Create AWS Policy</b></summary>

Attach policies to that user to grant access to the AWS SecretsManager and the AWS-KMS.
AWS has predefined policies (`SecretsManagerReadWrite` and ` AWSKeyManagementServicePowerUser`) that will work
but also grant a lot of permissions that are not needed. Your AWS IAM user needs to have to
following permissions:
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
> Note that this example policy grants access to all KMS and SecretsManager resources.
> You can restrict that by specifying a AWS ARN as resource instead `*`.

</details>

### KES Server Setup

<details><summary><b>1. Generate KES Server Private Key & Certificate</b></summary>

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

<details><summary><b>2. Generate Client Credentials</b></summary>

The client application needs some credentials to access the KES server. The following
command generates a new TLS private/public key pair:
```sh
$ kes identity new --key=client.key --cert=client.crt MyApp

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

### KES CLI Access

<details><summary><b>1. Set <code>KES_SERVER</code> Endpoint</a></summary>

The KES CLI needs to know to which server it should talk to:
```sh
$ export KES_SERVER=https://127.0.0.1:7373
```

</details>

<details><summary><b>2. Use Client Credentials</b></summary>

Further, the KES CLI needs some access credentials to talk to a KES server:
```sh
$ export KES_CLIENT_CERT=client.crt
```
```sh
$ export KES_CLIENT_KEY=client.key
```

</details>

<details><summary><b>3. Perform Operations</b></summary>

Now, we can perform any API operation that is allowed based on the
policy we assigned above. For example we can create a key:
```sh
$ kes key create my-key-1
```

Then, we can use that key to generate a new data encryption key:
```sh
$ kes key dek my-key-1
{
  plaintext : UGgcVBgyQYwxKzve7UJNV5x8aTiPJFoR+s828reNjh0=
  ciphertext: eyJhZWFkIjoiQUVTLTI1Ni1HQ00tSE1BQy1TSEEtMjU2IiwiaWQiOiIxMTc1ZjJjNDMyMjNjNjNmNjY1MDk5ZDExNmU3Yzc4NCIsIml2IjoiVHBtbHpWTDh5a2t4VVREV1RSTU5Tdz09Iiwibm9uY2UiOiJkeGl0R3A3bFB6S21rTE5HIiwiYnl0ZXMiOiJaaWdobEZrTUFuVVBWSG0wZDhSYUNBY3pnRWRsQzJqWFhCK1YxaWl2MXdnYjhBRytuTWx0Y3BGK0RtV1VoNkZaIn0=
}
```

</details>