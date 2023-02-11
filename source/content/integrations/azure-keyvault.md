---
title: Azure KeyVault
date: 2023-02-08
draft: false
---

This guide shows how to setup a KES server that uses Azure KeyVault as a persistent key store:

```
                         ╔══════════════════════════════════════════════╗
┌────────────┐           ║  ┌────────────┐          ┌────────────────┐  ║
│ KES Client ├───────────╫──┤ KES Server ├──────────┤ Azure KeyVault │  ║
└────────────┘           ║  └────────────┘          └────────────────┘  ║
                         ╚══════════════════════════════════════════════╝
```

***


### Azure KeyVault

[Azure KeyVault](https://azure.microsoft.com/services/key-vault) is a managed KMS that provides a secret store that can be used by KES.

An external application, i.e. KES, that wants to store and access secrets in Azure KeyVault, has to be registered in [Azure Active Directory](https://azure.microsoft.com/services/active-directory) and needs client credentials. 

<details open="true"><summary><b>1. Active Directory Service</b></summary>

First navigate to your Active Directory service.

![Step 1](https://raw.githubusercontent.com/wiki/minio/kes/images/azure-keyvault-step1.png)

</details>

<details><summary><b>2. Register KES App</b></summary>

Then go to App registrations and register a new application for KES.

![Step 2](https://raw.githubusercontent.com/wiki/minio/kes/images/azure-keyvault-step2.png)

Now, you can give the application a name - e.g. `KES-Demo` and register it. 
Once completed, Azure will show you some details about your newly registered application. 

![Step 3](https://raw.githubusercontent.com/wiki/minio/kes/images/azure-keyvault-step3.png)

Some important fields are:
 - The application or client ID
 - The directory or tenant ID
 - The client credentials

The application directory ID will be UUIDs - like `c3b7badf-cd2b-4297-bece-4de5f2e575f6`.
However, there should be no client credentials, yet. So, we need to create a client secret for your KES server.

</details>

<details><summary><b>3. Create Client Secret</b></summary>

Here, we select a client secret that we can give a name - e.g. `KES-Demo` - and select an expiry - e.g. 12 months:

![Step 5](https://raw.githubusercontent.com/wiki/minio/kes/images/azure-keyvault-step5.png)

Once completed, Azure will should a new secret with the chosen description and expiry. 
**Make sure to copy the secret value. It may not be shown to you again.**
This secret value will be required later by KES to authenticate to Azure KeyVault.

</details>

<details><summary><b>4. Application Summary</b></summary>

After navigating back to the application overview, Azure will show that the application now has one secret.

![Step 6](https://raw.githubusercontent.com/wiki/minio/kes/images/azure-keyvault-step6.png)

At this point you should have the following information about your Azure application:
 - The application / client ID. Here, `c3b7badf-cd2b-4297-bece-4de5f2e575f6`.
 - The directory / tenant ID. Here, `41a37d4e-b3c4-49f4-b330-1114fb0271c8`.
 - The value of the newly created secret. Here, `-.j4XP6Sa7E39.KWn-SL~Dgbz~H-H-TPxT`.

</details>

<details><summary><b>5. Navigate to KeyVault Policy Tab</b></summary>

Now, we can define which KeyVault API operations our external application (KES server) can perform.
Therefore, navigate to the `Access policies` tab of your KeyVault instance and add a new access policy.

![Step 7](https://raw.githubusercontent.com/wiki/minio/kes/images/azure-keyvault-step7.png)

</details>

<details><summary><b>6. Create KeyVault Policy</b></summary>

Here, we specify which KeyVault API your application has access to. Select the following five `Secret permissions`:

![Step 8](https://raw.githubusercontent.com/wiki/minio/kes/images/azure-keyvault-step8.png)

</details>

<details><summary><b>6. Assign Policy to Principal</b></summary>

Finally, we have to select a principal or an authorized application. The principal can either be the application itself - then no authorized application has to be selected. Alternatively, we can select a user or group as principal and select our newly registered KES Azure application as authorized application.

Here, we just set the principal. Therefore, we just search for the name of our application (`KES-Demo`), or insert the application UUID.

![Step 6](https://raw.githubusercontent.com/wiki/minio/kes/images/azure-keyvault-step9.png)

</details>

<details><summary><b>7. Policy Summary</b></summary>

Once added, Azure shows a new access policy associated to our registered KES application.

![Step 6](https://raw.githubusercontent.com/wiki/minio/kes/images/azure-keyvault-step10.png)

***Make sure you hit `Save` before navigating elsewhere.***

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
     azure:
       keyvault:
         endpoint: "https://kes-test-1.vault.azure.net"    # Use your KeyVault instance endpoint.
         credentials:
           tenant_id: ""      # The ID of the tenant the client belongs to - e.g: "41a37d4e-b3c4-49f4-b330-1114fb0271c8".
           client_id: ""      # The ID of the client                       - e.g: "c3b7badf-cd2b-4297-bece-4de5f2e575f6".
           client_secret: ""  # The value of the client secret             - e.g: "-.j4XP6Sa7E39.KWn-SL~Dgbz~H-H-TPxT".
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

### References

 - [**Server API Doc**](https://github.com/minio/kes/wiki/Server-API)
 - [**Go SDK Doc**](https://pkg.go.dev/github.com/minio/kes)