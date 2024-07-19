---
title: TLS Proxy
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---

This guide explains some Transport Layer Security (TLS) proxy concepts and how to setup and configure a TLS proxy in-front of a KES server.

```goat
                   +----------------------------------------+
 .----------.      |    .---------.       .----------.      |      .-----.
| KES Client +-----+---+ TLS Proxy +-----+ KES Server +-----+-----+  KMS  |
 '----------'      |    '---------'       '----------'      |      '-----' 
                   +----------------------------------------+
```

## TLS Proxy Basics

Use a TLS proxy to provide one common TLS endpoint for one or multiple services. 
A set of clients connect to one endpoint served by a TLS proxy.
The proxy, in turn, forwards the requests to the actual service(s). 


{{< admonition type="tip">}}
Some common TLS proxies include [HAProxy](https://www.haproxy.com/) or [Nginx](https://www.nginx.com/)
{{< /admonition >}}

Running a TLS proxy between your KES clients and KES servers has some pros and cons:

### Pros
 + Deploy multiple KES servers and expose them all under one common endpoint with one TLS certificate to all your clients.
 + The TLS proxy can balance the load across all KES servers.
 + The load balancing allows you to transparently add or remove KES servers according to the traffic and available resources.
 + The TLS proxy isolates the public-, client-facing part of your infrastructure from the internal part to some extent.

### Cons
 - The TLS proxy can act as any KES identity - including `root`, if not disabled. 
   It is very important to configure your TLS proxy securely and keep it up to date. 
   For more information take a look at the [Security Implications](#Security-Implications) and [Best Practices](#Best-Practices) sections below.
 - TLS proxies add additional overhead due to an additional TLS handshake. 
   However, modern TLS proxies make this additional overhead negligible for the user.

## Security Implications

Running a TLS proxy in front of your KES server(s) has some security implications. 
Each KES client has to present a valid X.509 TLS client certificate when establishing a connection to a KES server. 
However, when a TLS proxy sits in between the KES client and the KES server, the client cannot perform a TLS handshake with the KES server. 
Instead, the client has to perform a TLS handshake with the TLS proxy. 
The proxy then extracts and forwards the client's X.509 certificate to the KES server.

The presents a potential problem that the KES server cannot ensure that the client certificate received from the TLS proxy actually belongs to the client that performed the TLS handshake with the TLS proxy. 
A malicious TLS proxy could just lie to the KES server about which client has performed a TLS handshake. 

### Risk Scenario

Consider a scenario where client `A` connects to the TLS proxy and presents its client certificate.
In this scenario, the proxy could lie to the KES server and forward the certificate of client `B`. 
The KES server has no way to verify whether the TLS proxy is telling the truth about which client has made the request.
The KES server would assume that client `B` made the request and apply whatever policy is associated with `B`. 
The TLS proxy can also act as the `root` identity by forwarding the certificate of `root` and perform arbitrary operations unless the `root` identity has been disabled.

### Mitigation

Because of these possibilities, the TLS proxy must be a trusted component of the system.
You must configure and properly manage thr proxy to mitigate these risks.

## Best Practices

The [Security Implications](#Security-Implications) explained above require some best practice settings, particularly in production environments.

In general, identities cannot assign themselves to policies. 
For example identity `A` cannot assign `A` to a policy (no self-assignment). 

However, a malicious TLS proxy can circumvent this.
If there are two identities (`A` and `B`) where `A` can create a policy and `B` can assign `A` to a policy.
The TLS proxy could first use `A` to create a policy that has excessive permissions and then use `B` to assign `A` to this new policy.
Now, the malicious proxy could again act as `A` and perform whatever operation it has granted itself access to.

We suggest at least the following actions for such environments.

On KES servers that accept requests from TLS proxies:
- Disable the `root` identity with either of the following options.
  - Set the `root` entry in the config file for those servers to `_`.
  - Pass the flag `--root=_` when you start the server.
- Do not grant any identity  access to dangerous operations like `/v1/key/delete/<key-name>`. 
  In particular, consider the `/v1/policy/write/<policy-name>` API dangerous.
- Only connect KES servers to TLS proxies that have to serve client/application requests. 
  For routine management tasks, such as deleting a key, consider setting up a dedicated KES server only for the team that performs those tasks.
  Connect the management server to the same key store as the other servers, but do not place the management KES server behind the TLS proxy configuration.
- Enable audit logging. 
  Configure the KES server to log all API calls as audit events to an audit log.
   
## Tutorials

### Configure NGINX

The following NGINX configuration template routes client requests to `https://your.domain.com` to a KES server running on `localhost:7373`:

```nginx {.copy}
server {
    listen         443 ssl http2;
    server_name    your.domain.com;

    proxy_buffering off;
    client_max_body_size 0;

    ssl_certificate     /path/to/the/nginx-server.crt;
    ssl_certificate_key /path/to/the/nginx-server.key;

    # You may set this to:
    # - "ssl_verify_client on"
    #    The client has to provide a TLS client certificate
    #    and it must have been issued by a CA that nginx trusts.
    #
    # - "ssl_verify_client optional"
    #    The client may provide a TLS client certificate. If it does
    #    then the certificate must haven been issued by a CA that nginx
    #    trusts. (e.g. no self-signed)
    #    However, if the client does not send a certificate then the
    #    KES server will reject the request.
    #
    # - "ssl_verify_client optional_no_ca"
    #    The client may provide a TLS client certificate. It may not
    #    be issued by a CA that nginx trusts. (e.g. self-signed)
    #    However, if the client does not send a certificate then the
    #    KES server will reject the request.
    ssl_verify_client   optional_no_ca;
        
    location / {
       # The KES server endpoint.
       proxy_pass            https://localhost:7373;
       
       # Disable response buffering. Nginx will forward any
       # response sent by the KES server directly to the client
       # instead of writing it into its cache first. 
       proxy_buffering off;

       # This requires that the KES server presents a certificate
       # signed by a (public or internal) CA that is trusted by nginx.
       # For testing/development purposes you may set this to "grpc_ssl_verify off". 
       proxy_ssl_verify       on;

       # KES requires TLSv1.3.
       proxy_ssl_protocols    TLSv1.3;

       # The nginx client certificate used to authenticate nginx
       # to the KES server. The identity of this certificate must be
       # included in the list of TLS proxies. See KES config file.
       proxy_ssl_certificate       /path/to/the/nginx-client.cert;
       # The nginx client private key used to authenticate nginx
       # to the KES server.
       proxy_ssl_certificate_key   /path/to/the/nginx-client.key;

       # The header containing the forwarded certificate of the 
       # actual KES client. This value must match the corresponding
       # entry in the kes config file.
       # Nginx will replace $ssl_client_escaped_cert with the certificate
       # presented by the KES client.
       proxy_set_header X-Tls-Client-Cert $ssl_client_escaped_cert;
    }
}
```

#### Update the KES Configuration

You must add the NGINX identify to the list of TLS proxies on the KES server.

1. Obtain the identity of NGINX:
   
   ```sh {.copy}
   kes identity of </path/to/the/nginx-client.cert>
   ```

   **Note:** This is the certificate NGINX presents to KES to authenticate itself as the TLS proxy. 
   It **must** match the path you specified in the NGINX config file as `proxy_ssl_certificate`.

2. Use the following KES configuration template to add the identity to your KES config file:

   ```yaml {.copy}
   tls:
     proxy:
       # Add the identity of your Nginx proxy to the list of TLS proxies.
       # For example:
       identities:
       - c84cc9b91ae2399b043da7eca616048e4b4200edf2ff418d8af3835911db945d
       header:
         # The HTTP header containing the URL-escaped and PEM-encoded
         # certificate of the KES client. This must match the header Nginx
         # will set to forward the client certificate. 
         cert: X-Tls-Client-Cert
   ```

3. Restart the KES server. 
4. Verify that you can reach the KES server through NGINX 

   - Point the KES CLI client to your NGINX endpoint.

     To set the environment variable, use the following command, replacing your-domain.com with the address for your NGINX endpoint.

     ```sh {.copy}
     export KES_SERVER=https://your-domain.com
     ```

   - Perform an operation your identity has authorization to perform.

     For example, to list all policies:

     ```sh {.copy}
     kes policy list -k
     ```
     {{< admonition type="note">}}
     You can only perform operations if the policy attached to your identity allows them.
     If you act as the `root` identity because you have set `KES_CLIENT_TLS_CERT_FILE` to the root certificate file, then you should be able to perform any operation. 
     If you act as another identity that does not have the policy permission to list all policies then the KES server will reject the request with a `prohibited by policy` error.
     {{< /admonition >}}
     