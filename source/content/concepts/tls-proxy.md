---
title: TLS Proxy
date: 2023-02-08
draft: false
---

This guide explains some concepts around TLS proxies with regard to KES and shows how to setup and configure a TLS proxy in-front of a KES server.

1. **[Concepts](#concepts)**
2. **[Security Implications](#security-implications)**
3. **[Best Practices](#best-practices)**
4. **[Nginx Configuration](#nginx)**

```
                  ╔═══════════════════════════════════════╗
┌────────────┐    ║  ┌───────────┐     ┌────────────┐     ║     ┌───────┐
│ KES Client ├────╫──┤ TLS Proxy ├─────┤ KES Server ├─────╫─────┤  KMS  │
└────────────┘    ║  └───────────┘     └────────────┘     ║     └───────┘ 
                  ╚═══════════════════════════════════════╝
```
***

### Concepts

A TLS proxy, like [HAProxy](https://www.haproxy.com/) or [Nginx](https://www.nginx.com/), an be used to provide one common TLS endpoint for one or multiple services running behind the proxy. For example a set of clients can connect to one endpoint served by a TLS proxy, which then forwards the requests to the actual service(s). Running a TLS proxy between your KES clients and KES servers has some pros and cons:

#### Pros
 + You can deploy multiple KES servers and expose them all under one common endpoint with one TLS certificate to all your clients.
 + The TLS proxy can balance the load across all KES servers and you can transparently add or remove them according to the traffic and available resources.
 + The TLS proxy isolates the public-/client-facing part of your infrastructure from the internal part to some extend.

#### Cons
 - The TLS proxy can act as any KES identity - including `root`, if not disabled. Therefore, it is very important to configure your TLS proxy securely and keep it up to date. For more information take a look at the [Security Implications](#Security-Implications) and [Best Practices](#Best-Practices) sections.
 - TLS proxies, in general, add some additional overhead - due to an additional TLS handshake. However, modern TLS proxies are *really fast*!

### Security Implications

Running a TLS proxy in-front of your KES server(s) has some security implications. In general, each KES client has to present a valid X.509 TLS client certificate when establishing a connection to a
KES server. However, when a TLS proxy sits in between the KES client and the KES server then the client cannot perform a TLS handshake with the KES server. Instead, the client has to perform a TLS handshake with the TLS proxy. The proxy will then extract and forward the client's X.509 certificate to the KES server.

Now, there is the problem that the KES server cannot ensure that the client certificate (which it received from the TLS proxy) actually belongs to the client that performed the TLS handshake with the TLS proxy. A malicious TLS proxy could just lie to the KES server about which client has performed a TLS handshake. So, for example, if client `A` connects to the TLS proxy and presents its client certificate then the proxy could lie to the KES server and forward the certificate of client `B`. The KES server would assume that client `B` (instead of client `A`) has made the request and will apply whatever policy is associated with `B`. The KES server has no way to verify whether the TLS proxy is telling the truth about which client has made the request.  
Please note that the TLS proxy can also act as the `root` identity (by forwarding the certificate of `root`), and therefore, perform arbitrary operations unless the `root` identity has been disabled.

Therefore, the TLS proxy must be considered a trusted component of the system and should be configured and managed properly.

### Best Practices

As explained in [Security Implications](#Security-Implications) it is very important to configure and manage the TLS proxy securely. Further, for production deployments, you may want to follow some best practices to limit the damage a compromised TLS proxy can cause:
 - If possible, disable the `root` identity of all KES servers accepting requests from TLS proxies.
   Therefore, set the `root` entry in the config file to `_` or pass the flag `--root=_` when starting 
   the server.
 - If possible, do not grant any identity (on those KES servers) access to dangerous
   operations - like `/v1/key/delete/<key-name>`. In particular, the `/v1/policy/write/<policy-name>` API must be considered dangerous when using TLS proxies.
   > In general, identities cannot assign themselves to policies. For example identity `A` cannot
   > assign `A` to a policy (no self-assignment). However, a malicious TLS proxy can circumvent
   > that if there are two identities (`A` and `B`) where `A` can e.g. create a policy and `B` can
   > assign `A` to a policy.
   > A malicious TLS proxy could first use `A` to create a policy that has excessive permissions
   > and then use `B` to assign `A` to this new policy. Now, the malicious proxy could again act as
   > `A` and perform whatever operation it has granted itself access to.
 - Only connect KES servers to TLS proxies that have to serve client/application requests. If you
   need to perform some management tasks - like deleting a key - then you may want to setup a
   dedicated KES server only for the OPs-Team. This management KES server does not have a TLS proxy
   configuration but is connected to the same key store as the other KES servers.
 - Enable audit logging. The KES server can be configured to log all API calls as audit events to
   an audit log.
   
### Nginx

The following Nginx configuration template can be used to route client requests to `https://your.domain.com` to a KES server running on `localhost:7373`:
```nginx
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

Further, you have to tell the KES server that there is a TLS proxy that
may forward client requests. Therefore, you have to add the Nginx identity
to the list of TLS proxies.  
If you haven't installed or started a KES server yet, you may want to follow
our [Get Started Guide](https://github.com/minio/kes/wiki/Getting-Started) first.  

You can get the identity of Nginx via:
```sh
kes tool identity of </path/to/the/nginx-client.cert>
```
> Note that this is the certificate Nginx will present to KES to authenticate itself as the
> TLS proxy. It must match the path you specified in the Nginx config file as `proxy_ssl_certificate`.

You can use the following KES configuration snipped as template and add it to your KES config file:
```yaml
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

Once you've added your TLS proxy configuration to the KES config file you can restart your KES 
server. You can verify that you can reach the KES server through Nginx by:
 1. Point the KES CLI client to your Nginx endpoint:
    ```sh
    export KES_SERVER=https://your-domain.com
    ```
 2. Try to perform an operation - e.g. list all policies:
    ```sh
    kes policy list -k
    ```
    > Note that you can only perform operations if the policy attached to your identity allows them.
    > So, if you act as the `root` identity because you have set `KES_CLIENT_TLS_CERT_FILE` to the root
    > certificate file then you should be able to perform any operation. If you act as another identity
    > that does not have the policy permission to list all policies then the KES server will reject the
    > request with a `prohibited by policy` error.