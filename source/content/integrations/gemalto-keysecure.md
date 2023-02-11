---
title: Gemalto KeySecure
date: 2023-02-08
draft: false
---

This guide shows how to setup a KES server that uses a [Thales CipherTrust Manager](https://cpl.thalesgroup.com/encryption/ciphertrust-manager) instance (formerly known as Gemalto KeySecure) as a persistent and secure key store:
- [CipherTrust Manager Setup](#ciphertrust-manager-setup)
- [KES Server Setup](#kes-server-setup)

```
                         ╔══════════════════════════════════════════════════════╗
┌────────────┐           ║  ┌────────────┐             ┌─────────────────────┐  ║
│ KES Client ├───────────╫──┤ KES Server ├─────────────┤ CipherTrust Manager │  ║
└────────────┘           ║  └────────────┘             └─────────────────────┘  ║
                         ╚══════════════════════════════════════════════════════╝
```

### CipherTrust Manager Setup

This guide assumes that you have a running CipherTrust Manager instance. It has been tested with CipherTrust Manager `k170v` version `2.0.0` and Gemalto KeySecure `k170v` version `1.9.1` and `1.10.0`. To connect to your CipherTrust Manager instance via the `ksctl` CLI you need a `config.yaml` file similar to:
```yaml
KSCTL_URL: <your-keysecure-endpoint>
KSCTL_USERNAME: <your-user/admin-name>
KSCTL_PASSWORD: <your-user/admin-password>
KSCTL_VERBOSITY: false
KSCTL_RESP: json
KSCTL_NOSSLVERIFY: true
KSCTL_TIMEOUT: 30
```
> Please make sure to use correct values for `KSCTL_URL`, `KSCTL_USERNAME` and `KSCTL_PASSWORD`
> If your CipherTrust Manager instance has been configured with a TLS certificate trusted by your machine
> then you can also set `KSCTL_NOSSLVERIFY: false`.

1. First, we create a new group for KES:
   ```sh
   ksctl groups create --name KES-Service
   ```
2. Next, we create a new user that becomes part of the group:
   ```sh
   ksctl users create --name <username> --pword '<password>'
   ```
   > Note that this will print a JSON object containing a `user_id` which will be needed later on.
   > If you already have an existing user that you want to assign to the `KES-Service` group
   > you can skip this step and proceed with 3.
3. Then, we assign the user to the previously created `KES-Service` group:
   ```sh
   ksctl groups adduser --name KES-Service --userid "<user-ID>"
   ```
   > The user ID will be printed when creating the user or can be obtained via
   > the `ksctl users list` command. A user-ID is similar to: `local|8791ce13-2766-4948-a828-71bac67131c9`.

4. Now, there is one user who is part of the `KES-Service` group. Next, we have create a policy and attach
   it to the `KES-Service` group. The following `kes-policy.json` policy grants members of the `KES-Service`
   group **create**, **read** and **delete** permissions:
   ```json
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
   > This policy allows KES to create, fetch and delete master keys. If you want to
   > prevent KES from e.g. deleting master keys omit the **DeleteKey** action.
   > Similarly, you can restrict the master keys that can be accessed by KES via the
   > `resources` definition.

   The following command creates the policy:
   ```sh
   ksctl policy create --jsonfile kes-policy.json
   ```
5. Once the policy has been created, we have to attach it to the `KES-Service` group such that
   it becomes active. Therefore, we need the following `kes-attachment.json` policy attachment
   specification:
   ```json
   {                                                                                          
      "cust": {
         "groups": ["KES-Service"]
      }
   }
   ```
   The following command attaches our `kes-policy` to the `KES-Service` group:
   ```sh
   ksctl polattach create -p kes-policy -g kes-attachment.json
   ```
6. Finally, we can create a refresh token that will be used by the KES server to obtain short-lived
   authentication tokens. The following command returns a new refresh token:
   ```sh
   ksctl tokens create --user <username> --password '<password>' --issue-rt | jq -r .refresh_token
   ```
   > Here, we have to use a user that is a member of the `KES-Service` group.

   This command will output a refresh token - similar to:
   ```
   CEvk5cdHLG7si05LReIeDbXE3PKD082YdUFAnxX75md3jzV0BnyHyAmPPJiA0
   ```

### KES Server Setup

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
3. Now we have defined all entities in our demo setup. Let's wire everything together by creating the
   config file `server-config.yml`:
   ```yaml
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
   > Please use your refresh token.

4. Finally we can start a KES server in a new window/tab:  
   ```sh
   export APP_IDENTITY=$(kes tool identity of app.cert)
   
   kes server --config=server-config.yml --auth=off
   ```
   > `--auth=off` is required since our root.cert and app.cert certificates are self-signed.  
   > If starting the server fails with an error message similar to:
   > `x509: certificate is not valid for any names, but wanted to match <your-endpoint>` then
   > your CipherTrust Manager instance serves a TLS certificate with neither a common name (subject) nor
   > a subject alternative name (SAN). Such a certificate is invalid. Please update the TLS certificate
   > of your CipherTrust Manager instance. You can analyze a certificate with: `openssl x509 -text -noout <certificate>`

5. In the previous window/tab we now can connect to the server by:
   ```sh
   export KES_CLIENT_CERT=app.cert
   export KES_CLIENT_KEY=app.key
   kes key create -k my-app-key
   ```
   > `-k` is required because we use self-signed certificates  

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