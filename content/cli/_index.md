---
title: KES Command Line Interface
date: 2023-03-03
lastmod: :git
draft: false
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
| Linux    | amd64   | [linux-amd64](https://github.com/minio/kes/releases/latest/download/kes-linux-amd64)         |
| Linux    | arm64   | [linux-arm64](https://github.com/minio/kes/releases/latest/download/kes-linux-arm64)         |
| Linux    | ppc64le | [linux-ppc64le](https://github.com/minio/kes/releases/latest/download/kes-linux-ppc64le)     |
| Linux    | s390x   | [linux-s390x](https://github.com/minio/kes/releases/latest/download/kes-linux-s390x)         |
| Apple M1 | arm64   | [darwin-arm64](https://github.com/minio/kes/releases/latest/download/kes-darwin-arm64)       |
| Apple    | amd64   | [darwin-amd64](https://github.com/minio/kes/releases/latest/download/kes-darwin-amd64)       |
| Windows  | amd64   | [windows-amd64](https://github.com/minio/kes/releases/latest/download/kes-windows-amd64.exe) |

You can also verify the binary with [minisign](https://jedisct1.github.io/minisign/) by downloading the corresponding [`.minisig`](https://github.com/minio/kes/releases/latest) signature file. Then run:

```sh
minisign -Vm kes-<OS>-<ARCH> -P RWTx5Zr1tiHQLwG9keckT0c45M3AGeHD6IvimQHpyRywVWGbP1aVSGav
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

|Command                                       |Description                                |
|:---------------------------------------------|:------------------------------------------|
|**Start**                                     |                                           |
|[`init`]({{< relref "/cli/kes-init" >}})          |Initialize a stateful KES server or cluster|
|[`server`]({{< relref "/cli/kes-server" >}})      |Start a KES server                         |
|**Manage**                                    |                                           |
|[`enclave`]({{< relref "/cli/kes-enclave" >}})    |Manage KES enclaves                        |
|[`identity`]({{< relref "/cli/kes-identity" >}})  |Manage KES identities                      |
|[`key`]({{< relref "/cli/kes-key" >}})            |Manage cryptographic keys                  |
|[`policy`]({{< relref "/cli/kes-policy" >}})      |Manage KES policies                        |
|[`secret`]({{< relref "/cli/kes-secret" >}})      |Manage KES secrets                         |
|**Audit**                                     |                                           |
|[`log`]({{< relref "/cli/kes-log" >}})            |Print error and audit log events           |
|[`metric`]({{< relref "/cli/kes-metric" >}})      |Print server metrics                       |
|[`status`]({{< relref "/cli/kes-status" >}})      |Print server status                        |
|**Administer**                                |                                           |
|[`migrate`]({{< relref "/cli/kes-migrate" >}})    |Migrate KMS data                           |
|[`update`]({{< relref "/cli/kes-update" >}})      |Update KES binary                          |