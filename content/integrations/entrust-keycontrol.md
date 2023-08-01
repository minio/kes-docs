---
title: Entrust KeyControl
date: 2023-08-01
lastmod: :git
draft: false
tableOfContents: true
---

[Entrust KeyControl](https://www.entrust.com/digital-security/key-management/keycontrol) is a proprietary KMS that provides a secret store that can be used by KES.

```goat
                +-----------------------------------------+
 .----------.   |   .----------.    .------------------.  |
| KES Client +--+--+ KES Server +--+ Entrust KeyControl | |
 '----------'   |   '----------'    '------------------'  |
                +-----------------------------------------+
```

## Prerequisites


This guide assumes that you have setup an Entrust KeyControl v10.1 cluster. 

For instructions to set up an Entrust KeyControl cluster, refer to the Entrust documentation:
 - [Entrust KeyControl on AWS](https://docs.hytrust.com/DataControl/10.1/Online/Content/Books/Amazon-Web-Services/Creating-KC-Cluster-AWS/Configuring-the-First-KC-Node-AWS.html)
 - [Entrust KeyControl on prem](https://docs.hytrust.com/DataControl/10.1/Online/Content/OLH-Files/Help-content-map-all-books.html) 

## Set up Entrust KeyControl

Before setting up the KES Server, complete the following sections in KeyControl to add a new Vault, a Box, and one or more Users.

### Create a new Vault

1. Login into your KeyControl cluster as `secroot` and create a new **PASM** Vault.
2. Access Vault Management, then select **Create Vault**.
3. Make the following entries:

   - **Type**: PASM
   - **Name**: minio
   - **Description**: optional additional information for the vault, or leave blank
   - **Admin Name**: user name to to manage the vault
     
     Note: This user has complete access to the Vault.
   - **Admin Email**: Email address for the vault administrator
     
     Note: KeyControl sends a one-time password to this email address to access the vault.
     You need this password in the next step.

### Access the new Vault

1. Access the Vault URL
   
   This URL should be in the email with the one-time password.
   You can also find the URL from the Vault tab in KeyControl.
2. Use the admin user name and the one-time password emailed to you to access the vault


### Create a new Box

KeyControl stores secrets in a box inside the vault.
Add a box to store your secrets.

1. From the KeyControl Secrets Vault screen, select **Manage** then **Manage Boxes**
2. Select **Create** to add a new Box
  
   or

   Select **Add a Box Now** from the Manage Boxes page
4. Make the following entries ont he **About** page
   
   - **Name**: A descriptive name for the box, such as the MinIO Tenant name.
   - **Description**: Optional additional information about the secrets in the box.
   - **Secret Expiration**: leave blank
5. Select **Continue**
6. Leave the options on the **Checkout Details** page blank and click **Continue**
   
   {{< admonition type="important" >}}
   Do **NOT** select **Secret Checkout Duration**.
   {{< /admonition >}}

7. Leave the options on the **Rotation Details** page blank
   
   {{< admonition type="important" >}}
   Do **NOT** select **Secret Rotation Duration**.
   {{< /admonition >}}

8. Select **Create** to add the new Box

### Attach the 'Vault User' role policy

KeyControl uses Role-Based Access Control.
Add a policy with the `Vault User` role and attach the policy to the user account used by KES.

1. Create a new Access Policy
2. Make the following entries on the **About** page:

   - **Name**: KES Service
   - **Description**: Optional longer description for the policy
   - **Role**: Vault User Role
   - **Users**: The KeyControl account KES uses to access keys.
3. Select **Continue**
4. Make the following entries on the **Resources** page:

   - **Box**: Select the box you added in the previous step from the dropdown
   - **Secrets**: All Secrets
5. Select **Add** to create the policy and attach it to the selected user


## KES Server Setup

After creating a new vault, box inside the vault, and the user access policy in KeyControl, you can set up the KES server.

### Generate KES server private key & certificate


First, we need to generate a TLS private key and certificate for our KES server.
If you already have TLS certificate you want to use for your KES server you can
skip this step.

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

The client application needs some credentials to access the KES server. 
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

Use the yaml file you created to start a KES server instance.

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


1. Set `KES_SERVER` Endpoint

   The following environment variable specifies the server the KES CLI should talk to:

   ```sh {.copy}
   $ export KES_SERVER=https://127.0.0.1:7373
   ```

2. Define the Client Credentials

   The following environment variables set the access credentials the client uses to talk to a KES server:
   
   ```sh {.copy}
   $ export KES_CLIENT_CERT=client.crt
   ```

   ```sh {.copy}
   $ export KES_CLIENT_KEY=client.key
   ```

3. Test the Configuration
   
   Perform any API operation allowed by the policy we assigned above. 
   
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

## References

 - [Server API Doc]({{< relref "/concepts/server-api" >}})
 - [Go SDK Doc](https://pkg.go.dev/github.com/minio/kes)
 - [Entrust KeyControl Documentation](https://docs.hytrust.com/DataControl/10.1/Online/Content/OLH-Files/Help-content-map-all-books.html)