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
   
## References

 - [Server API Doc]({{< relref "/concepts/server-api" >}})
 - [Go SDK Doc](https://pkg.go.dev/github.com/minio/kes)
