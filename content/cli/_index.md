---
title: KES Command Line Interface
date: 2023-03-03
lastmod: :git
draft: false
heading: true
tableOfContents: true
---

## Quickstart

### Install

The KES server and CLI is available as a single binary, container image or can be build from source.

{{< tabs "kes-cli-binaries" >}}

{{< tab "Binary Downloads" >}}
Binary Releases

Download the binary for your OS and system architecture.

| OS       | ARCH    | Binary                                                                                       |
|:--------:|:-------:|:--------------------------------------------------------------------------------------------:|
| linux    | amd64   | [linux-amd64](https://github.com/minio/kes/releases/latest/download/kes-linux-amd64)         |
| linux    | arm64   | [linux-arm64](https://github.com/minio/kes/releases/latest/download/kes-linux-arm64)         |
| darwin   | arm64   | [darwin-arm64](https://github.com/minio/kes/releases/latest/download/kes-darwin-arm64)       |
| windows  | amd64   | [windows-amd64](https://github.com/minio/kes/releases/latest/download/kes-windows-amd64.exe) |

Download the binary via `curl` but replace `<OS>` and `<ARCH>` with your operating system and CPU architecture.
```sh
curl -sSL --tlsv1.2 'https://github.com/minio/kes/releases/latest/download/kes-<OS>-<ARCH>' -o ./kes
```
```sh
chmod +x ./kes
```

You can also verify the binary with [minisign](https://jedisct1.github.io/minisign/) by downloading the corresponding [`.minisig`](https://github.com/minio/kes/releases/latest) signature file. 
Run:
```sh
curl -sSL --tlsv1.2 'https://github.com/minio/kes/releases/latest/download/kes-<OS>-<ARCH>.minisig' -o ./kes.minisig
```
```sh
minisign -Vm ./kes -P RWTx5Zr1tiHQLwG9keckT0c45M3AGeHD6IvimQHpyRywVWGbP1aVSGav
```

{{< /tab >}}

{{< tab "Docker" >}}   

Pull the latest release via:
```
docker pull minio/kes
```
{{< /tab >}}

{{< tab "Homebrew" >}}
MacOS users can use [Homebrew](https://brew.sh/) to install KES:

```sh
brew install minio/stable/kes
```
{{< /tab >}}
   
{{< tab "Source" >}}

Download and install the binary via your Go toolchain:

```sh
go install github.com/minio/kes/cmd/kes@latest
```

{{< /tab>}}
{{< /tabs >}}

After obtaining the binary, run it from the terminal with any of the available commands.

## Available commands

|Command                                           |Description                            |
|:-------------------------------------------------|:--------------------------------------|
| **Start**                                        |                                       |
| [`server`]({{< relref "/cli/kes-server" >}})     | Start a KES server                    |
| **Manage**                                       |                                       |
| [`identity`]({{< relref "/cli/kes-identity" >}}) | Manage KES identities                 |
| [`key`]({{< relref "/cli/kes-key" >}})           | Manage cryptographic keys             |
| [`policy`]({{< relref "/cli/kes-policy" >}})     | Manage KES policies                   |
| **Audit**                                        |                                       |
| [`log`]({{< relref "/cli/kes-log" >}})           | Print error and audit log events      |
| [`metric`]({{< relref "/cli/kes-metric" >}})     | Print server metrics                  |
| [`status`]({{< relref "/cli/kes-status" >}})     | Print server status                   |
| **Administer**                                   |                                       |
| [`migrate`]({{< relref "/cli/kes-migrate" >}})   | Migrate KMS data                      |
| [`update`]({{< relref "/cli/kes-update" >}})     | Update KES binary                     |
