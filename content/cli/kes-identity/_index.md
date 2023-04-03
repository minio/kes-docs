---
title: kes identity
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Use the `kes identity` commands to temporarily manage the identities that access the KES server.
Use the command to display, list, create, or remove identities. 

All changes made by `kes identity` are lost when the KES server restarts. 
To make persistent changes to KES identities, modify the `Policies and Identities` section of the KES [configuration file]({{< relref "tutorials/configuration.md#config-file" >}}).
 Specifically, for each `policy.policyname` to modify, add/remove the identities to/from the `policy.policyname.identities` array.

This page provides reference information for the `kes identity` commands.

## Subcommands

|Subcommands                                       |Description                               |
|:-------------------------------------------------|:-----------------------------------------|
|[`info`]({{< relref "/cli/kes-identity/info" >}}) |Get information about a KES identity      |
|[`ls`]({{< relref "/cli/kes-identity/ls" >}})     |List KES identities                       |
|[`new`]({{< relref "/cli/kes-identity/new" >}})   |Create a KES identity                     |
|[`of`]({{< relref "/cli/kes-identity/of" >}})     |Compute a KES identity from a certificate |
|[`rm`]({{< relref "/cli/kes-identity/rm" >}})     |Delete a KES identity                     |


## Related Content

- [KES Policy Configuration]({{< relref "/tutorials/configuration.md#policy-configuration" >}})
- [Conceptual information on KES]({{< relref "/concepts/_index.md" >}})