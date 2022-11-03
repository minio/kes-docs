---
title: "Install KES"
date: 2022-11-01
draft: false
---

# Get KES

- Source Binary
 
  [Download KES](https://github.com/minio/kes/releases) for your operating system and architecture.

  Binaries are available for the following operating system and architecture combinations

  | OS       | ARCH    | Binary                                                                                       |
  |:--------:|:-------:|:--------------------------------------------------------------------------------------------:|
  | Linux    | amd64   | [linux-amd64](https://github.com/minio/kes/releases/latest/download/kes-linux-amd64)         |
  | Linux    | arm64   | [linux-arm64](https://github.com/minio/kes/releases/latest/download/kes-linux-arm64)         |
  | Linux    | ppc64le | [linux-ppc64le](https://github.com/minio/kes/releases/latest/download/kes-linux-ppc64le)     |
  | Linux    | s390x   | [linux-s390x](https://github.com/minio/kes/releases/latest/download/kes-linux-s390x)         |
  | Apple M1 | arm64   | [darwin-arm64](https://github.com/minio/kes/releases/latest/download/kes-darwin-arm64)       |
  | Apple    | amd64   | [darwin-amd64](https://github.com/minio/kes/releases/latest/download/kes-darwin-amd64)       |
  | Windows  | amd64   | [windows-amd64](https://github.com/minio/kes/releases/latest/download/kes-windows-amd64.exe) |

  Verify the download with [minisign](https://jedisct1.github.io/minisign/) by downloading the `.minisig` signature file from the same release page and running the following command:

  ```shell
  minisign -Vm kes-<OS>-<ARCH> -P RWTx5Zr1tiHQLwG9keckT0c45M3AGeHD6IvimQHpyRywVWGbP1aVSGav
  ```
  
  Replace `<OS>` and `<ARCH>` with values appropriate for your system.

- Docker 

  Pull the latest release via:

  ```shell
  docker pull minio/kes
  ```

- Build from source

  **Requires GO 1.18 or later.**
  Refer to [Go install documentation](https://golang.org/doc/install) for instructions.

  ```shell
  GO111MODULE=on go get github.com/minio/kes/cmd/kes
  ```

# Testing KES

After installing KES, you can interact with our public KES server instance at https://play.min.io:7373.
[Instructions are provided to use the CLI, server, or cURL.]({{< ref "/tutorials/test-kes.md">}})