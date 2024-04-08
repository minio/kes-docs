---
title: Hashicorp Vault Keystore
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---

This tutorial shows how to setup a KES server that uses [Vault's K/V engine](https://developer.hashicorp.com/vault/docs/secrets/kv) as a persistent and secure key store:

```goat
                 +------------------------------------+
 .----------.    |    .----------.     .---------.    |
| KES Client +---+---+ KES Server +---+   Vault   |   |
 '----------'    |    '----------'     '---------'    |
                 +------------------------------------+
```

## Vault Server Setup

KES requires Vault K/V engine [v1] or [v2] and credentials for either the AppRole or Kubernetes authentication method.

If you don't have a Vault cluster available you can either follow [Hashicorp Vault install guide](https://developer.hashicorp.com/vault/tutorials/getting-started/getting-started-deploy)
or create a single node dev instance.

Before starting a dev server or interacting with Vault via the Vault CLI download the [Vault binary](https://www.vaultproject.io/downloads/).
Next, start a Vault server in dev mode:

```sh
vault server -dev

==> Vault server configuration:

Administrative Namespace:
             Api Address: http://127.0.0.1:8200
                     Cgo: disabled
         Cluster Address: https://127.0.0.1:8201
   Environment Variables: 
              Go Version: go1.21.8
              Listener 1: tcp (addr: "127.0.0.1:8200", cluster address: "127.0.0.1:8201", disable_request_limiter: "false", max_request_duration: "
1m30s", max_request_size: "33554432", tls: "disabled")
               Log Level:
                   Mlock: supported: false, enabled: false
           Recovery Mode: false
                 Storage: inmem
                 Version: Vault v1.16.1, built 2024-04-03T12:35:53Z
             Version Sha: 6b5986790d7748100de77f7f127119c4a0f78946

==> Vault server started! Log data will stream in below:

...

WARNING! dev mode is enabled! In this mode, Vault runs entirely in-memory
and starts unsealed with a single unseal key. The root token is already
authenticated to the CLI, so you can immediately begin using Vault.

You may need to set the following environment variables:

    $ export VAULT_ADDR='http://127.0.0.1:8200'

The unseal key and root token are displayed below in case you want to
seal/unseal the Vault or re-authenticate.

Unseal Key: g+epWYiEy2vj+7UP3c+YXRhoOjUMCC9PoihIzqSgB84=
Root Token: hvs.O6QNQB33ksXtMxtlRKlRZL0R

Development mode should NOT be used in production installations!
```

{{< admonition type="note" >}}
This starts a single-node Vault server in dev mode listening on `127.0.0.1:8200`.
A dev server is ephemeral and is not meant to be run in production.
{{< /admonition >}}

1. Set `VAULT_ADDR` endpoint

   The Vault CLI needs to know the Vault endpoint:
   
   ```sh {.copy}
   export VAULT_ADDR='https://127.0.0.1:8200'
   ```
   
1. Set `VAULT_TOKEN`

   The Vault CLI needs an authentication token to perform operations.
   
   ```sh {.copy}
   export VAULT_TOKEN=hvs.O6QNQB33ksXtMxtlRKlRZL0R
   ```

   Adjust the token to your own Vault access token.

2. Enable `K/V` Backend

   KES stores the secret keys at the Vault K/V backend. 
   Vault provides two [K/V engines](https://www.vaultproject.io/docs/secrets/kv), `v1` and `v2`.
   
   MinIO recommends the K/V `v1` engine.

   The following command enables the K/V `v1` secret engine:

   ```sh {.copy}
   vault secrets enable -version=1 kv
   ```
   
   The following command enables the K/V `v2` secret engine:
   
   ```sh {.copy}
   $ vault secrets enable -version=2 kv
   ```

   {{< admonition type="note" >}}
   Note that the Vault policy for KES depends on the chosen K/V engine version.
   Using a policy designed for K/V `v1` with a K/V `v2` engine and vice versa will not work. 
   For more information about migrating from  `v1` to `v2` see [upgrading from v1](https://www.vaultproject.io/docs/secrets/kv/kv-v2#upgrading-from-version-1).
   {{< /admonition >}}
   
3. Create Vault Policy

   The Vault policy defines the API paths the KES server can access.
   
   - For `v1` 
    
     The following `kes-policy.hcl` policy should be used for the K/V `v1` backend:
    
     ```hcl {.copy}
     path "kv/*" {
        capabilities = [ "create", "read", "delete", "list" ]
     }
     ```
   
   - For `v2`
     The following `kes-policy.hcl` policy should be used for the K/V `v2` backend:
  
     ```hcl {.copy}
     path "kv/data/*" {
        capabilities = [ "create", "read" ]
     }
     path "kv/metadata/*" {
        capabilities = [ "list", "delete" ]       
     }
     ```
   
   The following command creates the policy at Vault:

   ```sh {.copy}
   vault policy write kes-policy kes-policy.hcl
   ```

4. Enable AppRole Authentication

    This step allows the KES server to authenticate to Vault. 
    For this tutorial, we use the AppRole authentication method. 
    
    ```sh {.copy}
    vault auth enable approle
    ```
    
5. Create KES Role

    The following command adds a new role `kes-server` at Vault:
    
    ```sh {.copy}
    vault write auth/approle/role/kes-server token_num_uses=0  secret_id_num_uses=0  period=5m
    ```

6. Bind Policy to Role

    The following command binds `kes-server` role to the `key-policy`:
    ```sh {.copy}
    vault write auth/approle/role/kes-server policies=kes-policy
    ```

7. Generate AppRole ID

    Request an AppRole ID for the KES server:
    ```sh {.copy}
    vault read auth/approle/role/kes-server/role-id 
    ```
8. Generate AppRole Secret

    Request an AppRole secret for the KES server:
    
    ```sh {.copy}
    vault write -f auth/approle/role/kes-server/secret-id 
    ```
    
    The AppRole secret prints as `secret_id`. 
    You can ignore the `secret_id_accessor`. 

## KES Server Setup

1. Generate KES Server Private Key & Certificate

   The following command generates a new TLS private key `server.key` and a self-signed X.509 certificate `server.cert` that is issued for the IP `127.0.0.1` and DNS name `localhost` (as SAN).
   If you want to refer to your KES server via another IP/DNS name, e.g. `10.1.2.3`, then adjust the `--ip` and/or `--dns` accordingly.
   
   ```sh {.copy}
   kes identity new --key server.key --cert server.cert --ip "127.0.0.1" --dns localhost
   ```
   
   {{< admonition type="tip" >}}
   The above command generates self-signed certificates. If you already have a way to issue certificates for your
   servers you can use such certificates as well.
  
   Additionally, any other tooling for X.509 certificate generation works as well. 
   For example, you could use `openssl`:
   
   ```sh {.copy}
   $ openssl ecparam -genkey -name prime256v1 | openssl ec -out server.key
   
   $ openssl req -new -x509 -days 30 -key server.key -out server.cert \
       -subj "/C=/ST=/L=/O=/CN=localhost" -addext "subjectAltName = IP:127.0.0.1"
   ```
   {{< /admonition >}}

2. Generate an API key

   The following command generates a new KES API key.

   ```sh
   $ kes identity new

   Your API key:
   
      kes:v1:ABfa1xsnIV0lltXQC8tHXic8lte7J6hT7EoGv6+s5QCW
   
   This is the only time it is shown. Keep it secret and secure!
   
   Your Identity:
   
      cf6c535e738c1dd47a1d746366fde7f0309d1e0a8471b9f6e909833906afbbfa
   
   The identity is not a secret. It can be shared. Any peer
   needs this identity in order to verify your API key.
   
   The identity can be computed again via:
   
       kes identity of kes:v1:ABfa1xsnIV0lltXQC8tHXic8lte7J6hT7EoGv6+s5QCW   
   ```

   {{< admonition type="tip" >}}
   The generated identity is NOT a secret and can be shared publicly. It will be used
   later on in the KES config file as admin identity or assigned to a policy.

   The API key itself is a secret and should not be shared. You can always recompute
   an API key's identity.
   {{< /admonition >}}

3. Configure KES Server

   Create the KES server configuration file: `config.yml`.
   
   Make sure that the identity in the policy section matches the `client.crt` identity.
   Add the approle `role_id` and `secret_id` obtained earlier.
   
   ```yaml {.copy}  
   admin:
     # Use the identity generated above by 'kes identity new'.
     identity: "" # For example: cf6c535e738c1dd47a1d746366fde7f0309d1e0a8471b9f6e909833906afbbfa
      
   tls:
     key: private.key    # The KES server TLS private key
     cert: public.crt    # The KES server TLS certificate
      
   keystore:
      vault:
        endpoint: https://127.0.0.1:8200
        version:  v1 # The K/V engine version - either "v1" or "v2".
        engine:   kv # The engine path of the K/V engine. The default is "kv".
        approle:
          id:     "" # Your AppRole ID
          secret: "" # Your AppRole Secret
   ```

4. Start KES Server
  
   **Linux**

   ```sh {.copy}
   kes server --config config.yml
   ```

   {{< admonition title="Linux Swap Protection" type="tip" >}}

   In Linux environments, KES can use the [`mlock`](http://man7.org/linux/man-pages/man2/mlock.2.html) syscall to prevent the OS from writing in-memory data to disk (swapping). 
   This prevents leaking sensitive data.
   
   Use the following command to allow KES to use the `mlock` syscall without running with `root` privileges:

   ```sh {.copy}
   $ sudo setcap cap_ipc_lock=+ep $(readlink -f $(which kes))
   ```
   {{< /admonition >}}

   **Containers**

   The following instructions use [Podman](https://podman.io/) to manage the containers.
   You can also use Docker.

   Modify addresses and file paths as needed for your deployment.

   ```sh {.copy}
   sudo podman pod create  \
     -p 9000:9000 -p 9001:9001 -p 7373:7373  \
     -v ~/minio-kes-vault/certs:/certs  \
     -v ~/minio-kes-vault/minio:/mnt/minio  \
     -v ~/minio-kes-vault/config:/etc/default/  \
     -n minio-kes-vault
   
   sudo podman run -dt  \
     --cap-add IPC_LOCK  \
     --name kes-server  \
     --pod "minio-kes-vault"  \
     -e KES_SERVER=https://127.0.0.1:7373  \
     quay.io/minio/kes:2024-01-11T13-09-29Z server  \
       --config=/etc/default/kes-config.yaml 
   ```

   You can verify the status of the containers using the following command.
   The command should show three pods, one for the Pod, one for KES, and one for MinIO.

   ```sh {.copy}
   sudo podman container list
   ```

## KES CLI Access

1. Set `KES_SERVER` endpoint

   The following environment variable specifies the server the KES CLI should talk to:

   ```sh {.copy}
   export KES_SERVER=https://127.0.0.1:7373
   ```

2. Define the CLI access credentials

   The following environment variables set the access credentials the client uses to talk to a KES server:
   
   ```sh {.copy}
   export KES_API_KEY=kes:v1:ABfa1xsnIV0lltXQC8tHXic8lte7J6hT7EoGv6+s5QCW
   ```

3. Test the Configuration
     
   For example, create a key:

   ```sh {.copy}
   kes status -k
   ```
   
   Use the key to generate a new data encryption key:

   ```sh
   $ kes key dek my-key-1 -k
   {
     plaintext : UGgcVBgyQYwxKzve7UJNV5x8aTiPJFoR+s828reNjh0=
     ciphertext: eyJhZWFkIjoiQUVTLTI1Ni1HQ00tSE1BQy1TSEEtMjU2IiwiaWQiOiIxMTc1ZjJjNDMyMjNjNjNmNjY1MDk5ZDExNmU3Yzc4NCIsIml2IjoiVHBtbHpWTDh5a2t4VVREV1RSTU5Tdz09Iiwibm9uY2UiOiJkeGl0R3A3bFB6S21rTE5HIiwiYnl0ZXMiOiJaaWdobEZrTUFuVVBWSG0wZDhSYUNBY3pnRWRsQzJqWFhCK1YxaWl2MXdnYjhBRytuTWx0Y3BGK0RtV1VoNkZaIn0=
   }
   ```

## Using KES with a MinIO Server

MinIO Server requires KES to enable server-side data encryption.

See the [KES for MinIO instruction guide]({{< relref "/tutorials/kes-for-minio.md" >}}) for additional steps needed to use your new KES Server with a MinIO Server.

## Configuration References

The following section describes the Key Encryption Service (KES) configuration settings to use Hashicorp Vault Keystore as the root KMS to store external keys, such as the keys used for Server-Side Encryption on a MinIO Server.

{{< admonition title="MinIO Server Requires Expanded Permissions" type="important" >}}
Starting with [MinIO Server RELEASE.2023-02-17T17-52-43Z](https://github.com/minio/minio/releases/tag/RELEASE.2023-02-17T17-52-43Z), MinIO requires expanded KES permissions for functionality. 
The example configuration in this section contains all required permissions.
{{< /admonition >}}

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
| `keystore.vault.endpoint` | The Vault endpoint. For example, `https://127.0.0.1:8200` |
| `keystore.vault.engine` | The path of the K/V engine. For example, `secrets`. <br><br> If empty, defaults to: `kv` (Vault default).  |
| `keystore.vault.version` | The K/V engine version, either `v1` or `v2`. `v1` engine is recommended. |
| `keystore.vault.namespace` | An optional [Vault namespace](https://www.vaultproject.io/docs/enterprise/namespaces/index.html). |
| `keystore.vault.prefix` | An optional K/V prefix. The server stores keys under this prefix. |
| `keystore.vault.transit` | Optionally encrypt keys stored on the K/V engine with a Vault-managed key. |
| `keystore.vault.transit.engine` | The path of the transit engine. For example, `my-transit`. <br><br> If empty, it defaults to: `transit` (Vault default). |
| `keystore.vault.transit.key` | The key name to use to encrypt entries stored on the K/V engine. |
| `keystore.vault.approle` | [AppRole credentials](https://www.vaultproject.io/docs/auth/approle.html). |
| `keystore.vault.approle.namespace` | Optional Vault namespace used only for authentication. For the Vault root namespace, use `/`. |
| `keystore.vault.approle.engine` | The path of the AppRole engine. For example, `authenticate`. <br><br> If empty, defaults to: `approle` (Vault default). |
| `keystore.vault.approle.id` | Your AppRole Role ID |
| `keystore.vault.approle.secret` | Your AppRole ID's secret |
| `keystore.vault.kubernetes` | [Kubernetes credentials](https://www.vaultproject.io/docs/auth/kubernetes). |
| `keystore.vault.kubernetes.namespace` | Optional Vault namespace used only for authentication. For the Vault root namespace, use "/". |
| `keystore.vault.kubernetes.engine` | The path of the Kubernetes engine. For example, `authenticate`. If empty, defaults to: `kubernetes` (Vault default). |
| `keystore.vault.kubernetes.role` | The Kubernetes JWT's role |
| `keystore.vault.kubernetes.jwt` | Either the JWT provided by Kubernetes or a path to a [Kubernetes secret](https://kubernetes.io/docs/concepts/configuration/secret/) containing the JWT. |
| `keystore.vault.tls` | The Vault client TLS configuration for mTLS authentication and certificate verification. |
| `keystore.vault.tls.key` | Path to the TLS client private key for mTLS authentication to Vault. |
| `keystore.vault.tls.cert` | Path to the TLS client certificate for mTLS authentication to Vault. |
| `keystore.vault.tls.ca` | Path to one or more PEM root CA certificates. |
| `keystore.vault.status` | Vault status configuration. The server will periodically reach out to Vault to check its status. |
| `keystore.vault.status.ping` | Duration until the server checks Vault's status again. For example, `10s`. |
{{< /tab >}}
{{< /tabs >}}

## Advanced Configuration

These additional configuration steps may solve specific problems.

### Multi-Tenancy with K/V prefixes

Vault can serve as backend for multiple, isolated KES tenants.
Each KES tenant can consist of `N` replicas.
There can be `M` KES tenants connected to the same Vault server/cluster. 

This means `N × M` KES server instances can connect to a single Vault.

In these configurations, each KES tenant has a separate prefix at the K/V secret engine. 
For each KES tenant, there must be a corresponding Vault policy.

- For K/V `v1`:

  ```hcl {.copy}
  path "kv/<tenant-name>/*" {
     capabilities = [ "create", "read", "delete" ]
  }
  ```
   
- For K/V `v2`:
   
  ```hcl {.copy}
  path "kv/data/<tenant-name>/*" {
    capabilities = [ "create", "read" ]
  }
  path "kv/metadata/<tenant-name>/*" {
    capabilities = [ "list", "delete" ]       
  }
  ```

Create a different configuration file for each KES tenant.
The file contains the Vault K/V prefix for the tenant to use.

```yaml {.copy}
keystore:
   vault:
     endpoint: https://127.0.0.1:8200
     prefix: <tenant-name>
     approle:
       id:     "" # Your AppRole ID
       secret: "" # Your AppRole Secret
       retry:  15s
     status:
       ping: 10s
     tls:
       ca: vault.crt # Manually trust the vault certificate since we use self-signed certificates
```

### Multi-Tenancy with Vault Namespaces

Vault can serve as the backend for multiple, isolated KES tenants.
Each KES tenant can consist of `N` replicas.
There can be `M` KES tenants connected to the same Vault server/cluster. 

This means `N × M` KES server instances can connect to a single Vault.

Therefore, each KES tenant has a separate prefix at the K/V secret engine. 
For each KES tenant there has to be a corresponding Vault policy.

- For K/V `v1`:
  ```hcl {.copy}
  path "kv/<tenant-name>/*" {
     capabilities = [ "create", "read", "delete" ]
  }
  ```

- For K/V `v2`:
  ```hcl {.copy}
  path "kv/data/<tenant-name>/*" {
     capabilities = [ "create", "read" ]
  }
  path "kv/metadata/<tenant-name>/*" {
     capabilities = [ "list", "delete" ]       
  }
  ```

Use a different configuration file for each KES tenant.
The file contains the Vault namespace which the KES tenant should use.

```yaml {.copy}
keystore:
   vault:
     endpoint: https://127.0.0.1:8200
     namespace: <vault-namespace>
     approle:
       id:     "" # Your AppRole ID
       secret: "" # Your AppRole Secret
       retry:  15s
     status:
       ping: 10s
     tls:
       ca: vault.crt # Manually trust the vault certificate since we use self-signed certificates
```

### Encrypt Vault-stored Keys

Hashicorp's [Transit](https://developer.hashicorp.com/vault/docs/secrets/transit) functionality provides a means to encrypt and decrypt keys stored in the vault.
This provides an additional layer of encryption that may be useful in specific use cases.

When enabled, Hashicorp stores a key in the Vault to encrypt or decrypt the other keys stored in the vault.
KES then uses the vault-managed key to store or retrieve keys from the Vault.

{{< admonition type="warning" >}}
If the specified transit key is incorrect, disabled, removed, or otherwise unaccessible, KES cannot retrieve any vault keys nor perform any en/decryption operations relying on those keys.
{{< /admonition >}}

To configure Transit, add the following section to the KES Configuration YAML's `keystore.vault` section:

```sh {.copy}
keystore:
  vault:
    transit:      # Optionally encrypt keys stored on the K/V engine with a Vault-managed key.
      engine: ""  # The path of the transit engine - e.g. "my-transit". If empty, defaults to: transit (Vault default)
      key: ""     # The key name that should be used to encrypt entries stored on the K/V engine.
```

## References

- [Server API Doc]({{< relref "/concepts/server-api" >}})
- [Go SDK Doc](https://pkg.go.dev/github.com/minio/kes)
