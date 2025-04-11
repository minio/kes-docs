---
title: Monitoring
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---

The KES server provides a [`metrics` API endpoint]({{< relref "server-api.md#metrics" >}}) that exposes various server metrics in the [Prometheus exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/).

## Prometheus Configuration

Use the following steps to get started monitoring KES with Prometheus.

1. Generate Prometheus Credentials

   Create credentials for the Prometheus server to use to authenticate to KES.

   ```sh {.copy}
   $ kes identity new --key client.key --cert client.crt prometheus

     Private key:  client.key
     Certificate:  client.crt
     Identity:     2169daa644eb18b41d85214a20f7272d449e85ef4f1bf3e2609fbe3fa7ca00cd
   ```

2. Create KES Policy

   Create a policy on the KES server that allows Prometheus to scrape the metrics.
   
   ```yaml {.copy}
   policy:
     prometheus:
       allow:
       - /v1/metrics
       identities:
       - 2169daa644eb18b41d85214a20f7272d449e85ef4f1bf3e2609fbe3fa7ca00cd # Use the identity of your client.crt
   ```
   {{< admonition type="note" >}}
   Restart the KES server after modifying the configuration file.
   {{< /admonition >}}

3. Create Prometheus Scrape Config

   Configure Prometheus to use the TLS client certificate when scraping the KES metrics.

   ```yaml {.copy}
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

After the KES and Prometheus servers start, Prometheus should detect and display a new KES target.

## Grafana

For a graphical dashboard, you can connect KES metrics scraped by Prometheus to Grafana.

![An example Grafana dashboard in dark mode showing KES metrics](../grafana-dashboard.png)

MinIO provides an example Grafana dashboard configuration for KES.
See the JSON file on [Github](https://github.com/minio/kes/blob/master/examples/grafana/dashboard.json).

## References

 - [Server API Doc]({{< relref "server-api.md" >}})
 - [Go SDK Doc](https://pkg.go.dev/github.com/minio/kes)