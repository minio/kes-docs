---
title: kes identity
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Use the `kes identity` commands to generate the API key of an PEM key file.

In addition, you can use subcommands to temporarily manage the identities that access the KES server.
Use the subcommand to display, create, or remove identities. 

All changes made by `kes identity` subcommands are lost when the KES server restarts. 
To make persistent changes to KES identities, modify the `Policies and Identities` section of the KES [configuration file]({{< relref "tutorials/configuration.md#config-file" >}}).
 Specifically, for each `policy.policyname` to modify, add/remove the identities to/from the `policy.policyname.identities` array.

This page provides information for the `kes identity` commands.

## Generate an API Key

You can pass an Ed25519 type private key (``.PEM``) file with this command the KES returns an API key and identity for that key file.
You can also pass the certificate (`.crt`) file or an API key and return the identity.

For example, passing the `my-private-key.pem` file returns the identity and API key to use for the private key.

```sh {.copy}
kes identity my-private-key.pem
```

Passing a certificate or an API key instead of a PEM key returns only the identity for the passed value.

```sh {.copy}
kes identity my-certificate.crt
```



## Subcommands

|Subcommands                                       |Description                               |
|:-------------------------------------------------|:-----------------------------------------|
|[`info`]({{< relref "/cli/kes-identity/info" >}}) |Get information about a KES identity      |
|[`new`]({{< relref "/cli/kes-identity/new" >}})   |Create a KES identity                     |
|[`of`]({{< relref "/cli/kes-identity/of" >}})     |Compute a KES identity from a certificate |


## Related Content

- [KES Policy Configuration]({{< relref "/tutorials/configuration.md#policy-configuration" >}})
- [Conceptual information on KES]({{< relref "/concepts/_index.md" >}})

## Deprecated

|Subcommands                                          |Description                                    |
|:----------------------------------------------------|:----------------------------------------------|
|[`ls`]({{< relref "/cli/deprecated/identity-ls" >}}) | Use [`kes ls`]({{< relref "/cli/kes-ls/" >}}) |