---
title: Fortanix SDKMS
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---

This tutorial shows how to setup a KES server that uses [Fortanix SDKMS](https://fortanix.com/platform/data-security-manager) as a persistent and secure key store:

```goat
                 +-----------------------------------------+
 .----------.    |    .----------.     .--------------.    |
| KES Client +<--+-->+ KES Server +<->+ Fortanix SDKMS |   |
 '----------'    |    '----------'     '--------------'    |
                 +-----------------------------------------+
```

## Fortanix SDKMS

1. Create Application

   Register a new application that can authenticate and communicate to the Fortanix SDKMS instance.
     
   - Go to the ` Apps` section in the Fortanix SDKMS UI.
   
     ![Step 1](/images/fortanix-sdkms-step1.png)
   
   - Give the application a descriptive name, such as `KES`
   - Select `REST API` as the integration 
   - Choose `API Key` as the authentication method
   
     ![Step 2](https://raw.githubusercontent.com/wiki/minio/kes/images/fortanix-sdkms-step2.png)

2. Assign Group

   The assigned group serves as the default for the application.
   Newly created keys belong to this group unless you specify an explicit group ID in the KES configuration file.

   ![Step 3](/images/fortanix-sdkms-step3.png)

3. Create the application and copy the application's API key. 

   This key is the access credential KES uses to talk to Fortanix SDKMS.
   
   ![Step 4](/images/fortanix-sdkms-step4.png)

## KES Server setup

The KES Server requires a TLS private key and certificate.

The KES server is [secure-by-default](https://en.wikipedia.org/wiki/Secure_by_default) and can only run with TLS. 
This tutorial uses self-signed certificates for simplicity.

{{< admonition type="note" >}}
For a production setup we highly recommend to use a certificate signed by trusted Certificate Authority.
This can be either your internal CA or a public CA such as [Let's Encrypt](https://letsencrypt.org).
{{< /admonition >}}

1. Generate a TLS private key and certificate for the KES server
 
   The following command generates a new TLS private key `server.key` and a self-signed X.509 certificate `server.cert` that is issued for the IP `127.0.0.1` and DNS name `localhost` (as SAN). 
   Customize the command to match your setup.
   
   ```sh
    kes tool identity new --server --key server.key --cert server.cert --ip "127.0.0.1" --dns localhost
   ```
   
   {{< admonition type="tip" >}}
   Any other tooling for X.509 certificate generation works as well. 
   For example, you could use `openssl`:
   
   ```sh
   $ openssl ecparam -genkey -name prime256v1 | openssl ec -out server.key
   
   $ openssl req -new -x509 -days 30 -key server.key -out server.cert \
       -subj "/C=/ST=/L=/O=/CN=localhost" -addext "subjectAltName = IP:127.0.0.1"
   ```
   {{< /admonition >}}

2. Create a private key and certificate

   ```sh
   kes tool identity new --key=app.key --cert=app.cert app
   ```

   You can compute the `app` identity anytime.
   ```sh
   kes tool identity of app.cert
   ```

3. Create Configuration file

   Create the [config file]({{< relref "/tutorials/configuration.md#config-file" >}}) named `server-config.yml`:
   
   ```yaml
   address: 0.0.0.0:7373
   
   admin:
     identity: disabled  # We disable the admin identity since we don't need it in this guide 
      
   tls:
     key : server.key
     cert: server.cert
      
   policy:
     my-app:
        allow:
        - /v1/key/create/my-app*
        - /v1/key/generate/my-app*
        - /v1/key/decrypt/my-app*    
       identities:
       - ${APP_IDENTITY}
      
    keystore:
      fortanix:
        sdkms:
          endpoint: "<your-fortanix-sdkms-endpoint>"    # Use your Fortanix instance endpoint.
          credentials:
            key: "<your-api-key>" # Insert the application's API key      
   ```

4. Start a KES server in a new window/tab:  
   
   ```sh
   export APP_IDENTITY=$(kes tool identity of app.cert)
   
   kes server --config=server-config.yml --auth=off
   ```
   
   {{< admonition type="note">}}
   The command uses `--auth=off` because our `root.cert` and `app.cert` certificates are self-signed.
   {{< /admonition >}}

5. In the other tab, connect to the server
  
   ```sh
   export KES_CLIENT_CERT=app.cert
   export KES_CLIENT_KEY=app.key
   kes key create -k my-app-key
    ```
   {{< admonition type="note">}}
   `-k` is required because we use self-signed certificates.
   {{< /admonition >}}

6. Derive and decrypt data keys from the previously created `my-app-key`:

   ```sh
   kes key derive -k my-app-key
   {
      plaintext : ...
      ciphertext: ...
   }
   ```   
   ```sh
   kes key decrypt -k my-app-key <base64-ciphertext>
   ```