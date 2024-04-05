---
title: Filesystem Keystore
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
weight: 50
---

Use this page to setup a KES server that uses the filesystem as persistent key store.


```goat
                    +------------------------------------------+
+------------+      |  +------------+          +------------+  |
| KES Client +------+--+ KES Server +----------+ Filesystem |  |
+------------+      |  +------------+          +------------+  |
                    +------------------------------------------+
```

{{< admonition title="Testing Only" type="caution" >}}
A plain filesystem does not provide any protection for the stored keys. 

**Only use the procedures on this page for testing purposes.**
{{< /admonition >}}

{{< admonition title="Existing Key & Certificate" type="note" >}}
If you already have a TLS private key & certificate, such as from a WebPKI or internal Certificate Authority, you can use them instead. 
Remember to adjust the `tls` config section.
{{< /admonition >}}

## KES Server Setup

1. Generate KES Server Private Key & Certificate
   
   Generate a TLS private key and certificate for the KES server.

   A KES server is [secure-by-default](https://en.wikipedia.org/wiki/Secure_by_default) and can only be run with TLS.
   In this guide, we use self-signed certificates for simplicity.
   
   The following command generates a new TLS private key (`private.key`) and a self-signed X.509 certificate (`public.crt`) issued for the IP `127.0.0.1` and DNS name `localhost`: 
   
   ```sh
   $ kes identity new --ip "127.0.0.1" localhost
   
     Private key:  private.key
     Certificate:  public.crt
     Identity:     2e897f99a779cf5dd147e58de0fe55a494f546f4dcae8bc9e5426d2b5cd35680
   ```
2. Generate Client Credentials

   The client application needs credentials to access the KES server. 
   The following command generates a new TLS private/public key pair:

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

3. Configure KES Server

   Create the KES server configuration file: `config.yml`.
   Ensure the identity in the `policy` section matches your `client.crt` identity.
   
   ```yaml {.copy}
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
     fs:
       path: ./keys # Choose a directory for the secret keys
   ```

4. Start KES Server
   
   ```sh  {.copy}
   kes server --config config.yml --auth off
   ```
   
   {{< admonition title="Linux Swap Protection" type="tip" >}}

   In Linux environments, KES can use the [`mlock`](http://man7.org/linux/man-pages/man2/mlock.2.html) syscall to prevent the OS from writing in-memory data to disk (swapping). 
   This prevents leaking sensitive data.
   
   Use the following command to allow KES to use the `mlock` syscall without running with `root` privileges:

   ```sh {.copy}
   sudo setcap cap_ipc_lock=+ep $(readlink -f $(which kes))
   ```

   Start a KES server instance with memory protection:
   
   ``` {.copy}
   kes server --config config.yml --auth off --mlock
   ```
   {{< /admonition >}}


## KES CLI Access

1. Set `KES_SERVER` endpoint

   This variable tells the KES CLI which KES server to access.

   ```sh {.copy}
   export KES_SERVER=https://127.0.0.1:7373
   ```

2. Use Client Credentials

   These variables tell the KES CLI which credentials to use to access to a KES server.

   ```sh {.copy}
   export KES_CLIENT_CERT=client.crt
   ```
   ```sh {.copy}
   export KES_CLIENT_KEY=client.key
   ```

3. Perform Operations

   Perform any API operation that is allowed based on the assigned policy. 
   
   {{< admonition type="note" >}}
   When running KES locally for testing purpose, use the `-k` or `--insecure` flag to generate a new key or data encryption key
   {{< /admonition >}}
   
   For example we can create a key:

   ```sh {.copy}
   kes key create my-key-1 -k
   ```
   
   Then, we can use that key to generate a new data encryption key:
   
   ```sh {.copy}
   kes key dek my-key-1 -k
   {
     plaintext : UGgcVBgyQYwxKzve7UJNV5x8aTiPJFoR+s828reNjh0=
     ciphertext: eyJhZWFkIjoiQUVTLTI1Ni1HQ00tSE1BQy1TSEEtMjU2IiwiaWQiOiIxMTc1ZjJjNDMyMjNjNjNmNjY1MDk5ZDExNmU3Yzc4NCIsIml2IjoiVHBtbHpWTDh5a2t4VVREV1RSTU5Tdz09Iiwibm9uY2UiOiJkeGl0R3A3bFB6S21rTE5HIiwiYnl0ZXMiOiJaaWdobEZrTUFuVVBWSG0wZDhSYUNBY3pnRWRsQzJqWFhCK1YxaWl2MXdnYjhBRytuTWx0Y3BGK0RtV1VoNkZaIn0=
   }
   ```  

## References

- [**Server API Doc**]({{< relref "Server-API" >}})
- [**Go SDK Doc**](https://pkg.go.dev/github.com/minio/kes)