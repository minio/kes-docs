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
   A KES server can only be run with TLS - since [secure-by-default](https://en.wikipedia.org/wiki/Secure_by_default).
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

   Create credentials for the client application to use to access the KES server. 
   
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

   ```
   $ kes server --config config.yml --auth off
   ```
   
   {{< admonition title="Linux Swap Protection" type="tip" >}}

   In Linux environments, KES can use the [`mlock`](http://man7.org/linux/man-pages/man2/mlock.2.html) syscall to prevent the OS from writing in-memory data to disk (swapping). 
   This prevents leaking sensitive data.
   
   Use the following command to allow KES to use the mlock syscall without running with `root` privileges:

   ```sh
   $ sudo setcap cap_ipc_lock=+ep $(readlink -f $(which kes))
   ```

   Start a KES server instance with memory protection:
   
   ```sh
   $ kes server --config config.yml --auth off --mlock
   ```
   {{< /admonition >}}

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
