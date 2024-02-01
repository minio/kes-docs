---
title: systemd
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---

This tutorial explains how to create a `systemd` service for KES on Linux systems.

## Install 

[Download](https://github.com/minio/kes/releases/latest) the latest KES binary for your architecture and OS.

For example on `linux/amd64`, run:

```sh {.copy}
curl -X GET 'https://github.com/minio/kes/releases/latest/download/kes-linux-amd64' --output kes-linux-amd64
```

```sh {.copy}
sudo install kes-linux-amd64  /usr/local/bin/kes
```

## Create User/Group

Create a new unix user and group for KES:

```sh {.copy}
useradd kes -s /sbin/nologin
```

{{< admonition type="note">}}
If you choose a different user and group name than `kes`, update the `kes.service` file.  
The `kes` user needs to have read access for the `/etc/kes/` directory.
{{< /admonition >}}
 
## Configuration

Update the KES server configuration under `/etc/kes/config.yml`.

To create a new KES server configuration file, see:
- [Config file guide]({{< relref "configuration/#config-file" >}}) to setup KES together with a supported KMS.
- [Annotated example](https://github.com/minio/kes/blob/master/server-config.yaml) for additional examples and documentation.

The following example is the configuration file from our [FileSystem Guide](https://github.com/minio/kes/wiki/Filesystem-Keystore):

```yaml {.copy}
address: 0.0.0.0:7373
admin:
   identity: disabled  # We disable the admin identity since we don't need it in this guide 

tls:
  key:  private.key
  cert: public.crt

policy:
  my-app: 
    allow:
    - /v1/key/create/app-key*
    - /v1/key/generate/app-key*
    - /v1/key/decrypt/app-key*
    identities:
    - ${APP_IDENTITY}

keystore:
  fs:
    path: ./keys # Choose a directory for the secret keys
```

## systemd Service

Create the `systemd` service by creating a `kes.service` file under `/etc/systemd/system`

```ini {.copy}
[Unit]
Description=KES
Documentation=https://github.com/minio/kes/wiki
Wants=network-online.target
After=network-online.target
AssertFileIsExecutable=/usr/local/bin/kes

[Service]
WorkingDirectory=/etc/kes/

User=kes
Group=kes
ProtectProc=invisible

ExecStart=/usr/local/bin/kes server --config=/etc/kes/config.yaml

# Let systemd restart this service always
Restart=always

# Specifies the maximum file descriptor number that can be opened by this process
LimitNOFILE=65536

# Specifies the maximum number of threads this process can create
TasksMax=infinity

# Disable timeout logic and wait until process is stopped
TimeoutStopSec=infinity
SendSIGKILL=no

# Enable memory locking features used to prevent paging.
AmbientCapabilities=CAP_IPC_LOCK

[Install]
WantedBy=multi-user.target
```

### Privileged Ports 

If you intend to run KES on a privileged port number (one less than `1024`) with the service running as a regular non-`root` user, add the bind capability via the  `AmbientCapabilities` directive in the `kes.service` file:

```ini {.copy}
[Service]
AmbientCapabilities=CAP_NET_BIND_SERVICE
```

### Startup on Reboot

To automatically start KES after rebooting run:

```sh {.copy}
systemctl enable kes.service
```

{{< admonition title="Disable `kes.service` on start" type="tip" >}}
Prevent KES from starting after reboot by running: 

```sh {.copy}
systemctl disable kes.service
```
{{< /admonition >}}

### Start or Stop KES

To start KES run:

```sh {.copy}
systemctl start kes.service
```

To stop KES run:
```sh {.copy}
systemctl stop kes.service
```
