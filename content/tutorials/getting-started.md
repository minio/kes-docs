---
title: Getting Started
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
weight: 1
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

{{< admonition title="Development Mode" type="note" >}}
For a quick development test server, use

```sh {.copy}
kes server --dev
```

This starts a KES server on `127.0.0.1:7373` and stores keys in memory.
{{< /admonition >}}

1. Install the KES binary

   You can install the KES binary by:
   - downloading a pre-compiled **Binary Release**
   - pulling the **Docker** image
   - issuing a **Homebrew** command
   - compiling from **Source** with your Go toolchain
   
   Select the tab below for the method you would like to use.

   {{< tabs "kes-binary-install" >}}
   
   {{< tab "Binary Releases" >}} 

   MinIO provides the following pre-compiled KES binary files.
   Download the binary for your operating system and system architecture.
   
   | **OS**         | **ARCH** | **Binary**                                                                                   |
   |----------------|----------|----------------------------------------------------------------------------------------------|
   | Linux          | amd64    | [linux-amd64](https://github.com/minio/kes/releases/latest/download/kes-linux-amd64)         |
   | Linux          | arm64    | [linux-arm64](https://github.com/minio/kes/releases/latest/download/kes-linux-arm64)         |
   | Linux          | ppc64le  | [linux-ppc64le](https://github.com/minio/kes/releases/latest/download/kes-linux-ppc64le)     |
   | Linux          | s390x    | [linux-s390x](https://github.com/minio/kes/releases/latest/download/kes-linux-s390x)         |
   | Apple (M1, M2) | arm64    | [darwin-arm64](https://github.com/minio/kes/releases/latest/download/kes-darwin-arm64)       |
   | Apple (Intel)  | amd64    | [darwin-amd64](https://github.com/minio/kes/releases/latest/download/kes-darwin-amd64)       |
   | Windows       | amd64    | [windows-amd64](https://github.com/minio/kes/releases/latest/download/kes-windows-amd64.exe) |

   - Optionally, verify the binary using [minisign](https://jedisct1.github.io/minisign/) by downloading the corresponding [`.minisign` signature file](https://github.com/minio/kes/releases/latest).
     Then fun the following command, replacing `<OS>` and `<ARCH>` with the values for your system:

     ```shell {.copy}
     minisign -Vm kes-<OS>-<ARCH> -P RWTx5Zr1tiHQLwG9keckT0c45M3AGeHD6IvimQHpyRywVWGbP1aVSGav
     ```

   - Mark the downloaded file as executable if necessary for your OS.

     For example, run `chmod +x <path/to/file>`.
   - Optionally, move the file to the desired run location or to a folder in your system's path or add the file's location to the system path.

     For example, if you put the binary in `$HOME/minio-binaries`, run the following:

     ```shell {.copy}
     export PATH=$PATH:@HOME/minio-binaries/
     ```

   **Important:** 
   
   - For Windows: Invoke the Windows executable file from the terminal, PowerShell, or Command Prompt.
     You cannot double click the file from the Windows graphical user interface.

   - For macOS: Create an exception to allow macOS to open the executable downloaded from the Internet.
     
     1. Locate the binary in Finder. 
     2. `CTRL + Click` the file, then select `Open`.
     3. Follow the prompts to open the app and create a security exception.
     4. Close the window that opens showing the KES help page.
     5. Return to the Terminal and verify you can access KES with `./kes -h`. 


   {{< /tab >}}

   {{< tab "Docker" >}} 
   Pull the release with the following command:

   ```shell {.copy}
   docker pull minio/kes
   ``` 

   {{< /tab >}}

   {{< tab "Homebrew" >}} 

   To install the KES binary with [Homebrew](https://brew.sh), run the following command:

   ```shell {.copy}
   brew install minio/stable/kes
   ```

   {{< /tab >}}

   {{< tab "Source" >}} 

   You can download and install the binary with your Go toolchain:

   ```shell {.copy}
   go install github.com/minio/kes/cmd/kes@latest
   ```

   {{< /tab >}}

   {{< /tabs >}}

   Confirm command availability by running the following command from your prompt or terminal:

   ```shell {.copy}
   kes --help
   ```

   You may need to adjust the command for your OS structure and PATH, such as with `./kes --help`.

2. Generate KES Server Private Key & Certificate

   Generate a TLS private key and certificate for the KES server.
   This key is used for domain name verification.

   A KES server is [secure-by-default](https://en.wikipedia.org/wiki/Secure_by_default) and can only be run with TLS.
   In this guide, we use self-signed certificates for simplicity.
   
   The following command generates a new TLS private key (`private.key`) and a self-signed X.509 certificate (`public.crt`) issued for the IP `127.0.0.1` and DNS name `localhost`: 
   
   ```sh
   $ kes identity new --ip "127.0.0.1" --key "private.key" --cert "public.crt" localhost
   
     Private key:  private.key
     Certificate:  public.crt
     Identity:     2e897f99a779cf5dd147e58de0fe55a494f546f4dcae8bc9e5426d2b5cd35680
   ```
   
   {{< admonition title="Existing Key & Certificate" type="note" >}}
   If you already have a TLS private key & certificate, such as from a WebPKI or internal Certificate Authority, you can use them instead. 
   Remember to adjust the `tls` config section.
   {{< /admonition >}}
 
3. Generate Client Credentials

   The client application needs credentials to access the KES server.
   Generate an API key from the client's key and certificate to verify the client application to the KES server.

   The following command generates a new TLS private/public key pair for `MyApp`:

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

4. Configure KES Server

   Create the KES server configuration file: `config.yml`.
   Ensure the identity in the `policy` section matches your `client.crt` identity.

   ```yaml {.copy}
   address: 0.0.0.0:7373 # Listen on all network interfaces on port 7373
   
   admin:
     identity: 02ef5321ca409dbc7b10e7e8ee44d1c3b91e4bf6e2198befdebee6312745267b # The client.crt identity
      
   tls:
     key: private.key    # The KES server TLS private key
     cert: public.crt    # The KES server TLS certificate
   ```

5. Start KES Server

   Start the KES server instance:

   ```sh {.copy}
   kes server --config config.yml
   ```

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

   Now, we can perform any API operation. 
   Since we are using the admin identity, we do not have to worry about policy permissions.

   ```sh {.copy}
   kes key create my-key-1
   ```
   
   Then, we can use that key to generate a new data encryption key:

   ```sh
   $ kes key dek my-key-1
   {
     plaintext : UGgcVBgyQYwxKzve7UJNV5x8aTiPJFoR+s828reNjh0=
     ciphertext: eyJhZWFkIjoiQUVTLTI1Ni1HQ00tSE1BQy1TSEEtMjU2IiwiaWQiOiIxMTc1ZjJjNDMyMjNjNjNmNjY1MDk5ZDExNmU3Yzc4NCIsIml2IjoiVHBtbHpWTDh5a2t4VVREV1RSTU5Tdz09Iiwibm9uY2UiOiJkeGl0R3A3bFB6S21rTE5HIiwiYnl0ZXMiOiJaaWdobEZrTUFuVVBWSG0wZDhSYUNBY3pnRWRsQzJqWFhCK1YxaWl2MXdnYjhBRytuTWx0Y3BGK0RtV1VoNkZaIn0=
   }
   ```

## Upgrading KES

To upgrade KES, follow the getting started steps and replace the KES binary with the newer version on each KES server node.

{{< admonition type="important" >}}
Due to changes in how KES processes ciphertext, it is not possible to revert to an earlier version after upgrading to release `2024-02-29T08-12-28Z` or later.
MinIO recommends always testing in a lower environment such as staging or development prior to upgrading production.
{{< /admonition >}}

## References

- [**Server API Doc**]({{< relref "server-api" >}})
- [**Go SDK Doc**](https://pkg.go.dev/github.com/minio/kes)
