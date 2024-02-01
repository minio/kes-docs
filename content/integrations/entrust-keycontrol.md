---
title: Entrust KeyControl
date: 2023-08-01
lastmod: :git
draft: false
tableOfContents: true
---

[Entrust KeyControl](https://www.entrust.com/digital-security/key-management/keycontrol) is a proprietary KMS which KES supports using for storing secrets.

```goat
                +-----------------------------------------+
 .----------.   |   .----------.    .------------------.  |
| KES Client +--+--+ KES Server +--+ Entrust KeyControl | |
 '----------'   |   '----------'    '------------------'  |
                +-----------------------------------------+
```

## Prerequisites

This procedure was written and tested against Entrust KeyControl v10.1. 
The provided instructions may work against other KeyControl versions.
This procedure assumes you have prior experience with Entrust products and have followed their documentation, best practices, and other published materials in deploying the KeyControl service.

For instructions to set up an Entrust KeyControl cluster, refer to the Entrust documentation:
 - [Entrust KeyControl on AWS](https://docs.hytrust.com/DataControl/10.1/Online/Content/Books/Amazon-Web-Services/Creating-KC-Cluster-AWS/Configuring-the-First-KC-Node-AWS.html)
 - [Entrust KeyControl on-premises](https://docs.hytrust.com/DataControl/10.1/Online/Content/OLH-Files/Help-content-map-all-books.html) 

## Set up Entrust KeyControl

Before setting up the KES Server, complete the following sections in KeyControl to add a new Vault, a Box, and one or more Users.

### Create a new Vault

Log in to your KeyControl cluster with a user that has root-level permissions (for example, `secroot`) and create a new **PASM** vault.

Make entries similar to the following:

   - **Type**: `PASM`
   - **Name**: `minio`
   - **Description**: Optional additional information for the vault, or leave blank.
   - **Admin Name**: User name to to manage the vault.
     
     Note: This user has complete access to the Vault.
   - **Admin Email**: Email address for the vault administrator
     
     Note: KeyControl sends a one-time password to this email address to access the vault.
     You need this password in the next step.

Make other required entries as per KeyControl or your own guidelines.
You can set the Name and Description to be more specific to your MinIO deployment or according to your own guidelines.

### Access the new Vault

1. Access the Vault URL.
   
   This URL should be in the email with the one-time password.
   You can also find the URL from the Vault tab in KeyControl.
2. Use the admin user name and the one-time password sent by email to access the Vault.


### Create a new Box

KeyControl stores secrets in a Box inside the Vault.
Add a Box to store your secrets.

Follow the prompts and make entries similar to the following:
   
   - **Name**: A descriptive name for the box, such as the MinIO Tenant name.
   - **Description**: Optional additional information about the secrets in the box.
   - **Secret Expiration**: leave blank.
   - **Secret Checkout Duration**: leave blank.
   - **Secret Rotation Duration**: leave blank.

Make other required entries as per KeyControl or your own guidelines.

### Attach the 'Vault User' role policy

KeyControl uses Role-Based Access Control.
Add a policy with the `Vault User` role and attach the policy to the user account used by KES.

Follow the prompts and make entries similar to the following:

   - **Name**: KES Service.
   - **Description**: Optional longer description for the policy.
   - **Role**: Vault User Role.
   - **Users**: The KeyControl account KES uses to access keys.
   - **Box**: Select the box you added in the previous step from the dropdown.
   - **Secrets**: All Secrets.

Make other required entries as per KeyControl or your own guidelines.


## KES Server Setup

After creating a new vault, box inside the vault, and the user access policy in KeyControl, you can set up the KES server.

### Generate KES server private key & certificate

Generate a TLS private key and certificate for your KES server.
If you already have either a TLS certificate you want to use for your KES server or a working KES server, you can skip this step.

The following command generates a new TLS private key (`private.key`) and a self-signed X.509 certificate (`public.crt`) issued for the IP `127.0.0.1` and DNS name `localhost`.

```sh {.copy}
kes identity new --key private.key --cert public.crt --ip "127.0.0.1" --dns localhost
```

The output resembles the following:

```sh
Your API key:

   kes:v1:APvbt/zbiewXNB+EwciOT+I21peq0odFYCwkJX8mMCxM

This is the only time it is shown. Keep it secret and secure!

Your Identity:

   1d1f89ad528a3bbb8fd64252d443c993f5a4d679b074d5bad49785e02ec38199

The identity is not a secret. It can be shared. Any peer
needs this identity in order to verify your API key.

The generated TLS private key is stored at: private.key
The generated TLS certificate is stored at: public.crt

The identity can be computed again via:

    kes identity of kes:v1:APvbt/zbiewXNB+EwciOT+I21peq0odFYCwkJX8mMCxM
    kes identity of public.crt
```
 
### Generate a new API key

The client application requires credentials in order to access the KES server. 
The following command generates a new API key.

```sh {.copy}
kes identity new
```

The resulting key resembles:

```sh
Your API key:

   kes:v1:AOlQZJRMYZeOioGk0ubYBMSFt1w6Hh1QZl3zG4PQxK/g

This is the only time it is shown. Keep it secret and secure!

Your Identity:

   eb559798a2fbcc3efbf036bed11108116e63f293324abdfe7574249ef5e56b36

The identity is not a secret. It can be shared. Any peer
needs this identity in order to verify your API key.

The identity can be computed again via:

    kes identity of kes:v1:AOlQZJRMYZeOioGk0ubYBMSFt1w6Hh1QZl3zG4PQxK/g
```

### Configure the KES Server

Create the KES server configuration file: `config.yml`.
Make sure that the identity in the policy section matches your API key identity.

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
    - /v1/key/create/my-key*
    - /v1/key/generate/my-key*
    - /v1/key/decrypt/my-key*
    identities:
    - eb559798a2fbcc3efbf036bed11108116e63f293324abdfe7574249ef5e56b36 # Use the identity of your API key
   
keystore:
     entrust:
       keycontrol:
         endpoint: "https://keycontrol.my-org.com"    # Use your KeyControl instance endpoint.
         vault_id: ""                                 # The Vault ID - e.g: "e30497c1-bff7-4e81-beb7-fb35c4b7410c".
         box_id:   ""                                 # The Box name or ID - e.g: "tenant-1".
         credentials:
           username: ""                               # KeyControl username - e.g: "kes-tenant-1@my-org.com".
           password: ""                               # Password of KeyControl user
```

### Start the KES Server

Use the YAML file you created to start a KES server instance.

```sh {.copy}
kes server --config config.yml --auth off
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

### KES CLI Access


1. Set the `KES_SERVER` Endpoint.

   The following environment variable specifies the server the KES CLI should talk to:

   ```sh {.copy}
   $ export KES_SERVER=https://127.0.0.1:7373
   ```

2. Define the Client Credentials.

   The following environment variables set the access credentials the client uses to talk to a KES server:
   
   ```sh {.copy}
   $ export KES_CLIENT_CERT=client.crt
   ```

   ```sh {.copy}
   $ export KES_CLIENT_KEY=client.key
   ```

3. Test the Configuration.
   
   Perform any API operation allowed by the policy defined in the KES server configuration file. 
   
   For example, create a key:

   ```sh {.copy}
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


{{< tabs "entrust-config" >}}
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
  entrust:
    # The Entrust KeyControl configuration.
    # For more information take a look at:
    # https://www.entrust.com/digital-security/key-management/keycontrol
    keycontrol:
      endpoint: ""     # The KeyControl endpoint - e.g. https://keycontrol.my-org.com
      vault_id: ""     # The Vault ID            - e.g. e30497c1-bff7-4e81-beb7-fb35c4b7410c
      box_id:   ""     # The Box name or ID      - e.g. tenant-1
      # The KeyControl access credentials
      credentials:
        username: ""   # The username able to access the Vault and Box.
        password: ""   # The user password
      # The KeyControl client TLS configuration
      tls:
        ca: ""         # Path to one or multiple PEM-encoded CA certificates for verifying the KeyControl TLS certificate.

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
| `keystore.entrust.keycontrol.endpoint` | The KeyControl endpoint. For example, `https://keycontrol.my-org.com`. |
| `keystore.entrust.keycontrol.vault_id` | The Vault ID. For example, `e30497c1-bff7-4e81-beb7-fb35c4b7410c`. |
| `keystore.entrust.keycontrol.box_id` | The Box name or ID. For example, `tenant-1`. |
| `keystore.entrust.keycontrol.credentials.username` | The username able to access the Vault and Box. |
| `keystore.entrust.keycontrol.credentials.password` | The user password. |
| `keystore.entrust.keycontrol.tls.ca` | Path to one or multiple PEM-encoded CA certificates for verifying the KeyControl TLS certificate. |

{{< /tab >}}
{{< /tabs >}}


## References

 - [Server API Doc]({{< relref "/concepts/server-api" >}})
 - [Go SDK Doc](https://pkg.go.dev/github.com/minio/kes)
 - [Entrust KeyControl Documentation](https://docs.hytrust.com/DataControl/10.1/Online/Content/OLH-Files/Help-content-map-all-books.html)