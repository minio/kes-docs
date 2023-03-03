---
title: Google Cloud Secret Manager
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---



This tutorial shows how to setup a KES server that uses GCP Secret Manager as a persistent key store. 

```goat
                 +---------------------------------------------+
 .----------.    |    .----------.     .------------------.    |
| KES Client +---+---+ KES Server +---+ GCP Secret Manager |   |
 '----------'    |    '----------'     '------------------'    |
                 +---------------------------------------------+
``` 

## Google Cloud Secret Manager

The [Google Cloud Secret Manager](https://cloud.google.com/secret-manager) is a key-value store for secrets, such as passwords, access tokens, and cryptographic keys.

1. Login in to the [GCP console](https://console.cloud.google.com)
2. Create a new project or select an existing project
3. Enable the [Secret Manager service](https://console.cloud.google.com/security/secret-manager) if not already enabled for your project
4. Go to [GCP IAM for service accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) and create a new service account for KES. 
   KES uses this service account to authenticate to GCP and access the Secret Manager.
   
5. Assign one or more roles to the new account 

   If you just want to get started quickly, assign the `Secret Manager Admin` role. 
   However, this grants more permissions than KES needs.

   Alternatively, [create a new role for KES](https://console.cloud.google.com/iam-admin/roles) with the minimal permissions required:

   ```
    secretmanager.secrets.create
    secretmanager.secrets.delete
    secretmanager.secrets.get
   ```

6. [Create a key for the service account](https://console.cloud.google.com/iam-admin/serviceaccounts) via `Actions` - `Create Key`. 
   
   Use the `JSON` key format.

   GCP let's you download a JSON file with the following structure:

   ```json
   {
     "type":           "service_account",
     "project_id":     "<your-project-id>",
     "private_key_id": "<your-private-key-id>",
     "private_key":    "-----BEGIN PRIVATE KEY-----\n ... -----END PRIVATE KEY-----\n",
     "client_email":   "<your-service-account>@<your-project-id>.iam.gserviceaccount.com",
     "client_id":      "<your-client-id>"
   }
   ```
   
   Use this credentials file to configure KES to authenticate to GCP and access the SecretManager.

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

2. Create a private key and certificate for the application
 
   ```sh
   kes tool identity new --key=app.key --cert=app.cert app
   ```

   You can compute the `app` identity at any time.

   ```sh
   kes tool identity of app.cert
   ```

3. Create the [config file]({{< relref "/tutorials/configuration.md#config-file" >}}) `server-config.yml`

   ```yaml
   address: 0.0.0.0:7373
   root:    disabled  # We disable the root identity since we don't need it in this guide 
   
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
     gcp:
       secretmanager:
         project_id: "<your-project-id>"                  # Use your GCP project ID
         credentials:
           client_email: "<your-client-email>"            # Use the client email from your GCP credentials file
           client_id: "<your-client-id>"                  # Use the client ID from your GCP credentials file
           private_key_id: "<your-private-key-id"         # Use the private key ID from your GCP credentials file
           private_key: "-----BEGIN PRIVATE KEY----- ..." # Use the private key from your GCP credentials file

   ```

4. Start a KES server in a new window/tab:  

   ```sh
   export APP_IDENTITY=$(kes tool identity of app.cert)
   
   kes server --config=server-config.yml --auth=off
   ```
   
   {{< admonition type="note">}}
   The command uses `--auth=off` because our `root.cert` and `app.cert` certificates are self-signed.
   {{< /admonition >}}

5. In the other window or tab, connect to the server
 
   ```sh
   export KES_CLIENT_CERT=app.cert
   export KES_CLIENT_KEY=app.key
   kes key create -k my-app-key
   ```

   ```sh
   export APP_IDENTITY=$(kes tool identity of app.cert)
   
   kes server --config=server-config.yml --auth=off
   ```
   
   {{< admonition type="note">}}
   The command uses `--auth=off` because our `root.cert` and `app.cert` certificates are self-signed.
   {{< /admonition >}}
   
   Now, if you [go to the GCP Secret Manager](https://console.cloud.google.com/security/secret-manager), you should see a secret key named `my-app-key`.

6. Derive and decrypt data keys from the previously created `my-app-key`

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