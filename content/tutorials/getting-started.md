---
title: Getting Started
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---

This Quickstart shows you how to setup a local KES server that stores keys in-memory.

{{< admonition title="Not permanent" type="caution" >}}
The in-memory key store will lose all state on restarts. 
It should only be used for testing purposes.
{{< /admonition >}}

```goat
                  +----------------------------------+
 .----------.     |    .----------.     .---------.  |
| KES Client +----+---+ KES Server +---+ In-Memory | |
 '----------'     |    '----------'     '---------'  |
                  +----------------------------------+
```

## Quickstart

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
   
   {{< admonition title="Existing Key & Certificate" type="note" >}}
   If you already have a TLS private key & certificate, such as from a WebPKI or internal Certificate Authority, you can use them instead. 
   Remember to adjust the `tls` config section.
   {{< /admonition >}}
 
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

   ```yaml
   address: 0.0.0.0:7373 # Listen on all network interfaces on port 7373
   
   admin:
     identity: 02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b # The client.crt identity
      
   tls:
     key: private.key    # The KES server TLS private key
     cert: public.crt    # The KES server TLS certificate
   ```

4. Start KES Server

   Start the KES server instance:

   ```sh
   $ kes server --config config.yml --auth off
   ```

## KES CLI Access

1. Set `KES_SERVER` endpoint

   This variable tells the KES CLI which KES server to access.

   ```sh
   $ export KES_SERVER=https://127.0.0.1:7373
   ```

2. Use Client Credentials

   These variables tell the KES CLI which credentials to use to access to a KES server.

   ```sh
   $ export KES_CLIENT_CERT=client.crt
   ```
   ```sh
   $ export KES_CLIENT_KEY=client.key
   ```

3. Perform Operations

   Now, we can perform any API operation. 
   Since we are using the admin identity, we do not have to worry about policy permissions.

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

## References

- [**Server API Doc**]({{< relref "server-api" >}})
- [**Go SDK Doc**](https://pkg.go.dev/github.com/minio/kes)
