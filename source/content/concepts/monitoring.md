---
title: Monitoring
date: 2023-02-08
draft: false
---

The KES server provides a [`metrics`](https://github.com/minio/kes/wiki/Server-API#metrics)
API endpoint that exposes various server metrics in the
[Prometheus exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/).

### Prometheus Configuration

<details open="true"><summary><b>1. Generate Prometheus Credentials</b></summary>

The Prometheus server has to authenticate to KES, and therefore, needs access credentials.
```sh
$ kes identity new --key client.key --cert client.crt prometheus

  Private key:  client.key
  Certificate:  client.crt
  Identity:     2169daa644eb18b41d85214a20f7272d449e85ef4f1bf3e2609fbe3fa7ca00cd
```

</details>

<details><summary><b>2. Create KES Policy</b></summary>

At the KES server, we need to create a policy that allows Prometheus to scrape the metrics.
```yaml
policy:
  prometheus:
    allow:
    - /v1/metrics
    identities:
    - 2169daa644eb18b41d85214a20f7272d449e85ef4f1bf3e2609fbe3fa7ca00cd # Use the identity of your client.crt
```
> The KES server needs to be restarted after its configuration file has been modified.

</details>

<details><summary><b>3. Create Prometheus Scrape Config</b></summary>

As the last step we have to configure Prometheus to use the TLS client certificate when scraping the KES metrics.
Therefore, we use the following Prometheus scrape config:
```yaml
global:
  scrape_interval:     15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: KES
    scheme: https
    tls_config:
      cert_file: client.crt
      key_file:  client.key
      # ca_file: public.crt           # Optionally, specify the KES server CA certificate or the self-signed KES server certificate. 
    metrics_path: /v1/metrics
    static_configs:
      - targets: ['localhost:7373']   # Specify KES endpoint.
```

Once the KES server and the Prometheus server has been started, Prometheus should detect and display a new KES target.

</details>

### References

 - [**Server API Doc**](https://github.com/minio/kes/wiki/Server-API)
 - [**Go SDK Doc**](https://pkg.go.dev/github.com/minio/kes)