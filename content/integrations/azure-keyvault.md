---
title: Azure Key Vault
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---

This tutorial explains how to setup a KES Server to use [Azure Key Vault](https://azure.microsoft.com/en-us/products/key-vault/) as the persistent key store:

```goat
                   +------------------------------------------+
 .----------.      |   .----------.       .---------------.   |
| KES Client +-----+--+ KES Server +-----+ Azure Key Vault |  |
 '----------'      |   '----------'       '---------------'   |
                   +------------------------------------------+
```

## Azure Key Vault

Azure Key Vault is a managed KMS service that provides a secret store that can be used by KES.

As an external application, you must register KES in [Azure Active Directory](https://azure.microsoft.com/services/active-directory) and have client credentials to store and access secrets in Azure Key Vault. 

1. Active Directory Service

   - Navigate to **Azure Active Directory** and select **App registrations**.
   
     ![Step 1](/images/azure-keyvault-step1.png)

     ![Step 1](/images/azure-keyvault-step2.png)

   - Select **New registration**

2. Register KES App

   Give the application a name, such as `KES-Demo`, and register it. 
   Once completed, Azure will show you some details about your newly registered application. 
   
   ![Step 3](/images/azure-keyvault-step3.png)
   
   Take note of the following fields to use later:
   - Application (client) ID
   - Directory (tenant) ID
   
   These fields contain universally unique identifiers (UUIDs), similar to `c3b7badf-cd2b-4297-bece-4de5f2e575f6`.
   
3. Create Client Secret

   - Select **Add a certificate or secret**
   - Assign a name, such as `KES-Demo`
   - Select an expiration
  
   Azure creates a new secret with the chosen description and expiry.
   This secret is required by KES to authenticate to Azure Key Vault.

   {{< admonition type="caution">}}
   Make sure to copy the secret value. 
   It may not be shown again.
   {{< /admonition >}}

   ![Step 5](/images/azure-keyvault-step5.png)

4. Application Summary

   Navigate back to the application overview, and check that Azure shows that the application has one secret.
   
   ![Step 6](/images/azure-keyvault-step6.png)
   
   You should have the following information:
   - Application (client) ID
     
     In our example images, `c3b7badf-cd2b-4297-bece-4de5f2e575f6`.
   - Directory (tenant) ID

     In our example images, `41a37d4e-b3c4-49f4-b330-1114fb0271c8`.
   - The value of the newly created secret
     
     In our example images, `-.j4XP6Sa7E39.KWn-SL~Dgbz~H-H-TPxT`.
   
5. Add a Key Vault Policy

   Navigate to the Key Vault **Access policies** tab and select **Add Access Policy** to create a Key Vault policy.
   
   ![Step 7](/images/azure-keyvault-step7.png)

   Define which Key Vault operations the KES Server can perform.
   Select the following five `Secret permissions`:

   - Get
   - List
   - Set
   - Delete
   - Purge

   ![Step 8](/images/azure-keyvault-step8.png)

6. Assign Policy to Principal

   Select a principal or an authorized application. 

   If the application itself is the principal, no authorized application is required. 
   Alternatively, select a user or group as principal and select the newly registered KES Azure application as the authorized application.
   
   For this tutorial, we set the principal as the secret we added. 
   Search for the name of the application (`KES-Demo`) or add the Application ID.
   
   ![Step 6](/images/azure-keyvault-step9.png)

7. Policy Summary

   Azure shows a new access policy associated to our registered KES application.
   
   ![Step 7](/images/azure-keyvault-step10.png)

   {{< admonition type="warning" >}}
   Make sure you **Save** before navigating elsewhere.
   {{< /admonition >}}

## KES Server Setup

1. Generate KES Server Private Key & Certificate

   The KES server need both a TLS private key and a certificate.
   A KES server is [secure-by-default](https://en.wikipedia.org/wiki/Secure_by_default) and can only run with TLS.
   This tutorial uses self-signed certificates for simplicity.
   
   The following command generates a new TLS private key (`private.key`) and a self-signed X.509 certificate (`public.crt`) issued for the IP `127.0.0.1` and DNS name `localhost`: 
   
   ```sh
   $ kes identity new --ip "127.0.0.1" localhost
   
     Private key:  private.key
     Certificate:  public.crt
     Identity:     2e897f99a779cf5dd147e58de0fe55a494f546f4dcae8bc9e5426d2b5cd35680
   ```
   
   {{< admonition type="note">}}
   If you already have a TLS private key & certificate from WebPKI or an internal CA, you can use them instead. 
   Remember to adjust the `tls` config section.
   {{< /admonition >}}
 
2. Generate Client Credentials

   Use the following command to generate a new TLS private/public key pair for the client application to use to access the KES Server:
   
   ```sh
   $ kes identity new --key=client.key --cert=client.crt MyApp
   
     Private key:  client.key
     Certificate:  client.crt
     Identity:     02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b
   ```
   
   The identity `02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b` is a unique fingerprint of the public key in `client.crt`.
   You can re-compute the fingerprint at anytime:
   
   ```sh
   $ kes identity of client.crt
   
     Identity:  02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b
   ```

3. Configure the KES Server

   Create the KES [server configuration file]({{< relref "/tutorials/configuration.md#config-file" >}}): `config.yml`.
   Make sure that the identity in the policy section matches your `client.crt` identity.
   
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
        azure:
          keyvault:
            endpoint: "https://kes-test-1.vault.azure.net"    # Use your KeyVault instance endpoint.
            credentials:
              tenant_id: ""      # The ID of the tenant the client belongs to - e.g: "41a37d4e-b3c4-49f4-b330-1114fb0271c8".
              client_id: ""      # The ID of the client                       - e.g: "c3b7badf-cd2b-4297-bece-4de5f2e575f6".
              client_secret: ""  # The value of the client secret             - e.g: "-.j4XP6Sa7E39.KWn-SL~Dgbz~H-H-TPxT".
   ```

4. Start the KES Server
   
   {{< tabs "Azure-initialization" >}}
   {{< tab "Linux" >}}
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
   
   ```
   $ kes server --config config.yml --auth off --mlock
   ```
   {{< /admonition >}}

   {{< /tab >}}

   {{< tab "Containers" >}}

   The instructions use [Podman](https://podman.io/) to manage the containers.
   You can accomplish similar with Docker, if preferred.

   Modify addresses and file paths as needed for your deployment.

   ```sh {.copy}
   sudo podman pod create  \
     -p 9000:9000 -p 9001:9001 -p 7373:7373  \
     -v ~/minio-kes-azure/certs:/certs  \
     -v ~/minio-kes-azure/minio:/mnt/minio  \
     -v ~/minio-kes-azure/config:/etc/default/  \
     -n minio-kes-azure
   
   sudo podman run -dt  \
     --cap-add IPC_LOCK  \
     --name kes-server  \
     --pod "minio-kes-azure"  \
     -e KES_SERVER=https://127.0.0.1:7373  \
     -e KES_CLIENT_KEY=/certs/kes-server.key  \
     -e KES_CLIENT_CERT=/certs/kes-server.cert  \
     quay.io/minio/kes:2024-01-11T13-09-29Z server  \
       --auth  \
       --config=/etc/default/kes-config.yaml  \
   
   sudo podman run -dt  \
     --name minio-server  \
     --pod "minio-kes-azure"  \
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

   The following environment variable specifies the server the KES CLI should talk to:

   ```sh
   $ export KES_SERVER=https://127.0.0.1:7373
   ```

2. Define the Client Credentials

   The following environment variables set the access credentials the client uses to talk to a KES server:
   
   ```sh
   $ export KES_CLIENT_CERT=client.crt
   ```
   ```sh
   $ export KES_CLIENT_KEY=client.key
   ```

3. Test the Configuration
   
   Perform any API operation allowed by the policy we assigned above. 
   
   For example, create a key:

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


{{< tabs "azure-config" >}}
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
  azure:
    # The Azure KeyVault configuration.
    # For more information take a look at:
    # https://azure.microsoft.com/services/key-vault
    keyvault:
      endpoint: ""      # The KeyVault endpoint - e.g. https://my-instance.vault.azure.net
      # Azure client credentials used to
      # authenticate to Azure KeyVault.
      credentials:
        tenant_id: ""      # The ID of the tenant the client belongs to - i.e. a UUID.
        client_id: ""      # The ID of the client - i.e. a UUID.
        client_secret: ""  # The value of the client secret.
      # Azure managed identity used to
      # authenticate to Azure KeyVault
      # with Azure managed credentials.
      managed_identity:
        client_id: ""      # The Azure managed identity of the client - i.e. a UUID.

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
| `keystore.azure.keyvault.endpoint` | The KeyVault endpoint. For example, `https://my-instance.vault.azure.net`. |
| `keystore.azure.keyvault.credentials.tenant_id` | The ID of the tenant the client belongs to to use to authenticate to KeyVault, that is a UUID. |
| `keystore.azure.keyvault.credentials.client_id` | The ID of the client to use to authenticate to KeyVault, that is a UUID. |
| `keystore.azure.keyvault.credentials.client_secret` | The value of the client secret. |
| `keystore.azure.keyvault.managed_identity.client_id` | The Azure-managed identity of the client, that is a UUID. |

{{< /tab >}}
{{< /tabs >}}


## References

 - [Server API Doc]({{< relref "/concepts/server-api" >}})
 - [Go SDK Doc](https://pkg.go.dev/github.com/minio/kes)
