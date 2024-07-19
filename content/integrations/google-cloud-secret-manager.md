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

   If you want to get started quickly, assign the `Secret Manager Admin` role. 
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
   
   ```sh {.copy}
   kes identity new --server --key server.key --cert server.cert --ip "127.0.0.1" --dns localhost
   ```
   
   {{< admonition type="tip" >}}
   Any other tooling for X.509 certificate generation works as well. 
   For example, you could use `openssl`:
   
   ```sh {.copy}
   $ openssl ecparam -genkey -name prime256v1 | openssl ec -out server.key
   
   $ openssl req -new -x509 -days 30 -key server.key -out server.cert \
       -subj "/C=/ST=/L=/O=/CN=localhost" -addext "subjectAltName = IP:127.0.0.1"
   ```
   {{< /admonition >}}

2. Create a private key and certificate for the application
 
   ```sh {.copy}
   kes identity new --key=app.key --cert=app.cert app
   ```

   You can compute the `app` identity at any time.

   ```sh {.copy}
   kes identity of app.cert
   ```

3. Create the [config file]({{< relref "/tutorials/configuration.md#config-file" >}}) `server-config.yml`

   ```yaml {.copy}
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

   **Linux**

   ```sh {.copy}
   export APP_IDENTITY=$(kes identity of app.cert)
   
   kes server --config=server-config.yml --auth=off
   ```
   
   {{< admonition type="note">}}
   The command uses `--auth=off` because our `root.cert` and `app.cert` certificates are self-signed.
   {{< /admonition >}}


   **Containers**

   The following instructions use [Podman](https://podman.io/) to manage the containers.
   You can also use Docker.

   Modify addresses and file paths as needed for your deployment.

   ```sh {.copy}
   sudo podman pod create  \
     -p 9000:9000 -p 9001:9001 -p 7373:7373  \
     -v ~/minio-kes-gcp/certs:/certs  \
     -v ~/minio-kes-gcp/minio:/mnt/minio  \
     -v ~/minio-kes-gcp/config:/etc/default/  \
     -n minio-kes-gcp
   
   sudo podman run -dt  \
     --cap-add IPC_LOCK  \
     --name kes-server  \
     --pod "minio-kes-gcp"  \
     -e KES_SERVER=https://127.0.0.1:7373  \
     -e KES_CLIENT_KEY=/certs/kes-server.key  \
     -e KES_CLIENT_CERT=/certs/kes-server.cert  \
     quay.io/minio/kes:2024-01-11T13-09-29Z server  \
       --auth  \
       --config=/etc/default/kes-config.yaml  \
   
   sudo podman run -dt  \
     --name minio-server  \
     --pod "minio-kes-gcp"  \
     -e "MINIO_CONFIG_ENV_FILE=/etc/default/minio"  \
     quay.io/minio/minio:RELEASE.2024-01-31T20-20-33Z server  \
       --console-address ":9001"
   ```

   You can verify the status of the containers using the following command.
   The command should show three pods, one for the Pod, one for KES, and one for MinIO.

   ```sh {.copy}
   sudo podman container list
   ```

5. In the other window or tab, connect to the server
 
   ```sh {.copy}
   export KES_CLIENT_CERT=app.cert
   export KES_CLIENT_KEY=app.key
   kes key create -k my-app-key
   ```

   ```sh {.copy}
   export APP_IDENTITY=$(kes identity of app.cert)
   
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
   ```sh {.copy}
   kes key decrypt -k my-app-key <base64-ciphertext>
   ```

## Using KES with a MinIO Server

MinIO Server requires KES to enable server-side data encryption.

See the [KES for MinIO instruction guide]({{< relref "/tutorials/kes-for-minio.md" >}}) for additional steps needed to use your new KES Server with a MinIO Server.

## Configuration References

The following section describes the Key Encryption Service (KES) configuration settings to use Google Cloud Secret Manager as the root KMS to store external keys, such as the keys used for Server-Side Encryption on a MinIO Server.

{{< admonition title="MinIO Server Requires Expanded Permissions" type="important" >}}
Starting with [MinIO Server RELEASE.2023-02-17T17-52-43Z](https://github.com/minio/minio/releases/tag/RELEASE.2023-02-17T17-52-43Z), MinIO requires expanded KES permissions for functionality. 
The example configuration in this section contains all required permissions.
{{< /admonition >}}


{{< tabs "gcs-config" >}}
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

log:

  # Log error events to STDERR. Valid values are "on" or "off". 
  # Default is "on".
  error: on

  # Log audit events to STDOUT. Valid values are "on" and "off". 
  # Default is "off".
  audit: off

keystore:
  gcp:
    # https://cloud.google.com/secret-manager
    secretmanager:
      # See: https://cloud.google.com/resource-manager/docs/creating-managing-projects#before_you_begin
      project_id: ""
      endpoint: ""
      # Refer to: https://developers.google.com/identity/protocols/oauth2/scopes
      # If not set, the GCP default scopes are used.
      scopes: 
      - ""
      credentials:
        client_email: 
        client_id:    
        private_key_id: 
        private_key:   

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
| `keys`                        | Specify an array of keys which *must* exist on the root KMS for KES to successfully start. KES attempts to create the keys if they do not exist and exits with an error if it fails to create one or more keys. KES does not accept any client requests until it completes validation of all specified keys.|
| `cache`                       | Specify expiration of cached keys in `#d#h#m#s` format. Unexpired keys may be used in the event the KMS becomes temporarily unavailable. <br><br> Entries may be set for `any` key, `unused` keys, or `offline` keys. <br><br> If not set, KES uses values of `5m` for all keys, `20s` for unused keys, and `0s` for offline keys. |
| `log`                         | Enable or disable output for `error` and `audit` type logging events to the console. |
| `keystore.gcp.secretmanager.project_id` | The [project ID](https://cloud.google.com/resource-manager/docs/creating-managing-projects#before_you_begin) is a unique, user-assigned ID that can be used by Google APIs. The project ID must be a unique string of 6 to 30 lowercase letters, digits, or hyphens. It must start with a letter, and cannot have a trailing hyphen. |
| `keystore.gcp.secretmanager.endpoint` | An optional GCP SecretManager endpoint. If not set, defaults to: `secretmanager.googleapis.com:443`. |
| `keystore.gcp.secretmanager.scopes` | An optional list of [GCP OAuth2 scopes](https://developers.google.com/identity/protocols/oauth2/scopes). If not set, the GCP default scopes are used. |
| `keystore.gcp.secretmanager.credentials.client_email` | The service account email. For example, `<account>@<project-ID>.iam.gserviceaccount.com`. |
| `keystore.gcp.secretmanager.credentials.client_id` | The service account client ID. For example, `113491952745362495489` |
| `keystore.gcp.secretmanager.credentials.private_key_id` | The service account private key. For example, `381514ebd3cf45a64ca8adc561f0ce28fca5ec06`. |
| `keystore.gcp.secretmanager.credentials.private_key` | The raw encoded private key of the service account. For example, `-----BEGIN PRIVATE KEY-----\n ... \n-----END PRIVATE KEY-----\n`. |
{{< /tab >}}
{{< /tabs >}}
