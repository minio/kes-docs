---
title: SystemD
date: 2023-02-08
draft: false
---

The SystemD section shows how to create a systemd service for KES on Linux systems.

### 1. Install 

First, [download](https://github.com/minio/kes/releases/latest) the binary for your architecture and OS.
For example on `linux/amd64` you can run:
```sh
curl -X GET 'https://github.com/minio/kes/releases/latest/download/kes-linux-amd64' --output kes-linux-amd64
```
```sh
sudo install kes-linux-amd64  /usr/local/bin/kes
```

### 2. Create User/Group

Once the binary is installed, you can create a new unix user and group for KES:
```sh
useradd kes -s /sbin/nologin
```
> If you choose a different user and group name than `kes`, please make sure to update
> your `kes.service` file.  
> The `kes` user needs to have read access for the `/etc/kes/` directory.
 
### 3. Configuration

Next, you need to provide the KES server configuration under `/etc/kes/config.yml`.
If you haven't created your KES server configuration file you can refer to:
 - [Our guides](https://github.com/minio/kes/wiki#guides) to setup KES together with a supported KMS.
 - [Our documentation](https://github.com/minio/kes/wiki/Configuration) for more information about KES server configuration.
 - [Our annotated example](https://github.com/minio/kes/blob/master/server-config.yaml) for additional examples and documentation.

The following example is the configuration file from our [FileSystem Guide](https://github.com/minio/kes/wiki/Filesystem-Keystore):
```yml
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

### 4. Systemd Service

Finally, you can create your systemd service by creating a `kes.service` file under `/etc/systemd/system`
```ini
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

[Install]
WantedBy=multi-user.target
```

#### 4.1 Privileged Ports 

If KES should use a port number < 1024 (privileged port) with the service running as a regular 
user (not root), you will need to add the bind capability via the  `AmbientCapabilities`
directive in the `kes.service` file:
```ini
[Service]
AmbientCapabilities=CAP_NET_BIND_SERVICE
```

#### 4.2 Startup on Reboot

If you want to start KES after rebooting run:
```sh
systemctl enable kes.service
```
> You can prevent KES from starting after reboot anytime by running: `systemctl disable kes.service`

#### 4.3 Start/Stop KES

To start KES run:
```sh
systemctl start kes.service
```

To stop KES run:
```sh
systemctl stop kes.service
```