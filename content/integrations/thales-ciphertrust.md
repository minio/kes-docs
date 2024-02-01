---
title: Thales CipherTrust Manager (formerly Gemalto KeySecure)
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---

This tutorial shows how to setup a KES server that uses a [Thales CipherTrust Manager](https://cpl.thalesgroup.com/encryption/ciphertrust-manager) instance (formerly known as Gemalto KeySecure) as a persistent and secure key store.

```goat
                 +---------------------------------------------+
 .----------.    |    .----------.     .-------------------.   |
| KES Client +---+---+ KES Server +---+ CipherTrust Manager |  |
 '----------'    |    '----------'     '-------------------'   |
                 +---------------------------------------------+
```

This guide assumes that you have a running CipherTrust Manager instance. 
It has been tested with CipherTrust Manager `k170v` version `2.0.0` and Gemalto KeySecure `k170v` version `1.9.1` and `1.10.0`. 

## CipherTrust Manager Setup

To connect to your CipherTrust Manager instance via the `ksctl` CLI you need a `config.yaml` file similar to:

```yaml {.copy}
KSCTL_URL: <your-keysecure-endpoint>
KSCTL_USERNAME: <your-user/admin-name>
KSCTL_PASSWORD: <your-user/admin-password>
KSCTL_VERBOSITY: false
KSCTL_RESP: json
KSCTL_NOSSLVERIFY: true
KSCTL_TIMEOUT: 30
```

{{< admonition type="note">}}
Please make sure to use correct values for `KSCTL_URL`, `KSCTL_USERNAME` and `KSCTL_PASSWORD`
If your CipherTrust Manager instance has been configured with a TLS certificate trusted by your machine, then you can also set `KSCTL_NOSSLVERIFY: false`.
{{< /admonition >}}

1. Create a new group for KES
   
   ```sh {.copy}
   ksctl groups create --name KES-Service
   ```

2. Create a new user for the group

   {{< admonition type="tip">}}
   This prints a JSON object containing a `user_id` needed for a later step.
   If you already have an existing user that you want to assign to the `KES-Service` group, skip this step and proceed with 3.
   {{< /admonition>}}

   ```sh {.copy}
   ksctl users create --name <username> --pword '<password>'
   ```

3. Assign the user to the `KES-Service` group created in step 1
 
   ```sh {.copy}
   ksctl groups adduser --name KES-Service --userid "<user-ID>"
   ```

   The user ID prints when creating the user.
   Otherwise, obtain the ID with the `ksctl users list` command. 

   A user-ID is similar to: `local|8791ce13-2766-4948-a828-71bac67131c9`.

5. Create a policy for the `KES-Service` group
  
   Create a text file named `kes-policy.json` that grants members of the `KES-Service` group **create**, **read** and **delete** permissions.
   The contents of the file should be similar to the following:
   
   ```json {.copy}
   {                                                                                          
     "allow": true,
     "name": "kes-policy",
     "actions":[
         "CreateKey",
         "ExportKey",
         "ReadKey",
         "DeleteKey"
     ],
     "resources": [
         "kylo:kylo:vault:secrets:*"
     ]
   }
   ```

   {{< admonition type="note">}}
   This policy allows KES to create, fetch and delete master keys. 
   If you want to prevent KES from e.g. deleting master keys omit the **DeleteKey** action.
   
   Similarly, you can restrict the master keys that can be accessed by KES via the `resources` definition.
   {{< /admonition >}}

   Use the following command to create the policy using the file created above.

   ```sh {.copy}
   ksctl policy create --jsonfile kes-policy.json
   ```

6. Attach the policy to the `KES-Service` group
   
   Create a file named `kes-attachment.json` with the policy attachment specification:

   ```json {.copy}
   {                                                                                          
      "cust": {
         "groups": ["KES-Service"]
      }
   }
   ```

   Use the following command to attach the `kes-policy` to the `KES-Service` group:

   ```sh {.copy}
   ksctl polattach create -p kes-policy -g kes-attachment.json
   ```

8. Create a refresh token for the KES server to use to obtain short-lived authentication tokens.
   
   The following command returns a new refresh token:

   ```sh {.copy}
   ksctl tokens create --user <username> --password '<password>' --issue-rt | jq -r .refresh_token
   ```
   
   Replace `<username>` and `<password>` with the credentials for a user that is a member of the `KES-Service` group.

   The command outputs a refresh token similar to

   ```text
   CEvk5cdHLG7si05LReIeDbXE3PKD082YdUFAnxX75md3jzV0BnyHyAmPPJiA0
   ```

## KES Server Setup

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
   kes tool identity new --server --key server.key --cert server.cert --ip "127.0.0.1" --dns localhost
   ```
   
   {{< admonition type="tip" >}}
   Any other tooling for X.509 certificate generation works as well. 
   For example, you could use `openssl`:
   
   ```sh {.copy}
   openssl ecparam -genkey -name prime256v1 | openssl ec -out server.key
   
   openssl req -new -x509 -days 30 -key server.key -out server.cert \
       -subj "/C=/ST=/L=/O=/CN=localhost" -addext "subjectAltName = IP:127.0.0.1"
   ```
   {{< /admonition >}}

2. Create a private key and certificate for the application
 
   ```sh {.copy}
   kes tool identity new --key=app.key --cert=app.cert app
   ```

   You can compute the `app` identity at any time.

   ```sh {.copy}
   kes tool identity of app.cert
   ```

3. Create the [config file]({{< relref "/tutorials/configuration.md#config-file" >}}) `server-config.yml`

   ```yaml {.copy}
   address: 0.0.0.0:7373
   root:    disabled  # We disable the root identity since we don't need it in this guide 

   tls:
     key:  server.key
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
     gemalto:
       keysecure:
         endpoint: ""  # The REST API endpoint of your KeySecure instance - e.g. https://127.0.0.1
         credentials:
           token:  ""  # Your refresh token
           domain: ""  # Your domain. If empty, defaults to root domain.
           retry:  15s
         tls:
           ca: "" # Optionally, specify the certificate of the CA that issued the KeySecure TLS certificate.
   ```

   Use your refreshed token.

4. Start a KES server in a new window/tab:  

   ```sh {.copy}
   export APP_IDENTITY=$(kes tool identity of app.cert)
   
   kes server --config=server-config.yml --auth=off
   ```
   
   {{< admonition type="note">}}
   The command uses `--auth=off` because our `root.cert` and `app.cert` certificates are self-signed.
   {{< /admonition >}}

   If starting the server fails with an error message similar to:

   ```sh
   x509: certificate is not valid for any names, but wanted to match <your-endpoint>
   ```

   then your CipherTrust Manager instance serves a TLS certificate with neither a common name (subject) nor a subject alternative name (SAN). 
   Such a certificate is invalid. 
   Update the TLS certificate of your CipherTrust Manager instance. 
   
   You can analyze a certificate with: `openssl x509 -text -noout <certificate>`

5. In the other window or tab, connect to the server
 
   ```sh {.copy}
   export KES_CLIENT_CERT=app.cert
   export KES_CLIENT_KEY=app.key
   kes key create -k my-app-key
   ```

   ```sh {.copy}
   export APP_IDENTITY=$(kes tool identity of app.cert)
   
   kes server --config=server-config.yml --auth=off
   ```
   
   {{< admonition type="note">}}
   The command uses `--auth=off` because our `root.cert` and `app.cert` certificates are self-signed.
   {{< /admonition >}}

6. Derive and decrypt data keys from the previously created `my-app-key`
 
   ```sh {.copy}
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

MinIO Server requires KES to set up server-side data encryption.

See the [KES for MinIO instruction guide]({{< relref "/tutorials/kes-for-minio.md" >}}) for additional steps needed to use your new KES Server with a MinIO Server.


## Configuration References

The following section describes each of the Key Encryption Service (KES) configuration settings for using AWS Secrets Manager and AWS Key Management System as the root KMS for Server Side Encryption with KES.

{{< admonition title="MinIO Server Requires Expanded Permissions" type="important" >}}
Starting with [MinIO Server RELEASE.2023-02-17T17-52-43Z](https://github.com/minio/minio/releases/tag/RELEASE.2023-02-17T17-52-43Z), MinIO requires expanded KES permissions for functionality. 
The example configuration in this section contains all required permissions.
{{< /admonition >}}


{{< tabs "aws-config" >}}
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
  gemalto:
    # The Gemalto KeySecure key store. The server will store
    # keys as secrets on the KeySecure instance.
    keysecure:
      endpoint: ""    # The KeySecure endpoint - e.g. https://127.0.0.1
      credentials:    # The authentication to access the KeySecure instance.
        token: ""     # The refresh token to obtain new short-lived authentication tokens.
        domain: ""    # The KeySecure domain for which the refresh token is valid. If empty, defaults to the root domain.
        retry: 15s    # The time the KES server waits before it tries to re-authenticate after connection loss.
      tls:            # The KeySecure client TLS configuration
        ca: ""        # Path to one or multiple PEM-encoded CA certificates for verifying the KeySecure TLS certificate.
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
| `keystore.gemalto.keysecure.endpoint` | The KeySecure endpoint, for example `https://127.0.0.1` |
| `keystore.gemalto.keysecure.credentials` | The authentication to access the KeySecure instance. |
| `keystore.gemalto.keysecure.credentials.token` | The refresh token to obtain new short-lived authentication tokens. |
| `keystore.gemalto.keysecure.credentials.domain` | The KeySecure domain for which the refresh token is valid. If empty, defaults to the root domain. |
| `keystore.gemalto.keysecure.credentials.retry` | The time the KES server waits before it tries to re-authenticate after connection loss. For example, `15s`. |
| `keystore.gemalto.keysecure.tls` | The KeySecure client TLS configuration |
| `keystore.gemalto.keysecure.tls.ca` | Path to one or multiple PEM-encoded CA certificates for verifying the KeySecure TLS certificate. |

{{< /tab >}}
{{< /tabs >}}
