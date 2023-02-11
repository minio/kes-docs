---
title: Google Cloud Secret Manager
date: 2023-02-08
draft: false
---



This guide shows how to setup a KES server that uses GCP SecretManager as a persistent key store. 
- [Google Cloud Secret Manager](#google-cloud-secret-manager)
- [KES Server setup](#kes-server-setup)

```
                         ╔═════════════════════════════════════════════════╗
┌────────────┐           ║  ┌────────────┐          ┌───────────────────┐  ║
│ KES Client ├───────────╫──┤ KES Server ├──────────┤ GCP SecretManager │  ║
└────────────┘           ║  └────────────┘          └───────────────────┘  ║
                         ╚═════════════════════════════════════════════════╝
``` 

### Google Cloud Secret Manager

The [Google Cloud Secret Manager](https://cloud.google.com/secret-manager) is basically a key-value store for secrets - like passwords, access tokens and cryptographic keys.

1. As initial step, login in to your [GCP console](https://console.cloud.google.com) and create a new project or select an existing project.
   Then enable the [SecretManager service](https://console.cloud.google.com/security/secret-manager) if it isn't enabled for your project,
   already.
2. Once done, switch over to [GCP IAM for service accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) and create a new 
   service account for KES. This service account will be used by KES to authenticate to GCP and access the SecretManager.
   When creating the service account you can assign one or multiple roles to it. If you just want to get started quickly you can assign the
   `Secret Manager Admin` role. However, we recommend that you [create a new role for KES](https://console.cloud.google.com/iam-admin/roles)
   with the minimal permissions required:
   ```
    secretmanager.secrets.create
    secretmanager.secrets.delete
    secretmanager.secrets.get
   ```
3. When you have created a new service account with sufficient permissions you can [create a key for the service account](https://console.cloud.google.com/iam-admin/serviceaccounts) via `Actions` - `Create Key`. Please use the JSON key format.
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
   The content of this credentials file will be used to configure KES such that KES can authenticate to GCP and access the SecretManager.

### KES Server setup

First, we need to generate a TLS private key and certificate for our KES server.
A KES server can only be run with TLS - since [secure-by-default](https://en.wikipedia.org/wiki/Secure_by_default). Here we use self-signed certificates for simplicity.
For a production setup we highly recommend to use a certificate signed by CA
(e.g. your internal CA or a public CA like [Let's Encrypt](https://letsencrypt.org))

1. Generate a TLS private key and certificate for the KES server.  
   The following command will generate a new TLS private key `server.key` and
   a X.509 certificate `server.cert` that is self-signed and issued for the IP `127.0.0.1`
   and DNS name `localhost` (as SAN). You may want to customize the command to match your
   setup.
   ```sh
   kes tool identity new --server --key server.key --cert server.cert --ip "127.0.0.1" --dns localhost
   ```
   > Any other tooling for X.509 certificate generation works as well. For example, you could use `openssl`:
   > ```
   > $ openssl ecparam -genkey -name prime256v1 | openssl ec -out server.key
   >
   > $ openssl req -new -x509 -days 30 -key server.key -out server.cert \
   >    -subj "/C=/ST=/L=/O=/CN=localhost" -addext "subjectAltName = IP:127.0.0.1"
   > ```

2. Then, create private key and certificate for your application:
   ```sh
   kes tool identity new --key=app.key --cert=app.cert app
   ```
   You can compute the `app` identity via:
   ```sh
   kes tool identity of app.cert
   ```
3. Now, we have defined all entities in our demo setup. Let's wire everything together by creating the
   config file `server-config.yml`:
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

4. Finally we can start a KES server in a new window/tab:  
   ```sh
   export APP_IDENTITY=$(kes tool identity of app.cert)
   
   kes server --config=server-config.yml --auth=off
   ```
   > `--auth=off` is required since our root.cert and app.cert certificates are self-signed

5. In the previous window/tab we now can connect to the server by:
   ```sh
   export KES_CLIENT_CERT=app.cert
   export KES_CLIENT_KEY=app.key
   kes key create -k my-app-key
   ```
   > `-k` is required because we use self-signed certificates  
   
   Now, if you [go to the GCP SecretManager](https://console.cloud.google.com/security/secret-manager) you should see
   a secret key named `my-app-key`.

6. Finally, we can derive and decrypt data keys from the previously created `my-app-key`:
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