---
title: kes policy
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview


The :mc:`kes policy` commands temporarily create, modify, list, remove, or display policies on the MinIO Key Encryption Service (KES). 

All changes made by `kes policy` commands are lost when the KES server restarts. 
To make persistent changes to KES policies, modify the `policy` section of the KES [configuration file]({{< relref "tutorials/configuration.md#config-file" >}}).
 Specifically, for each `policy.policyname` to modify, add/remove the identities to/from the `policy.policyname.identities` array.

## Subcommands

|Subcommands                                         |Description                     |
|:---------------------------------------------------|:-------------------------------|
|[`assign`]({{< relref "/cli/kes-policy/assign" >}}) |Assign a policy to identities   |
|[`create`]({{< relref "/cli/kes-policy/create" >}}) |Create a new policy             |
|[`info`]({{< relref "/cli/kes-policy/info" >}})     |Get information about a policy  |
|[`ls`]({{< relref "/cli/kes-policy/ls" >}})         |List policies                   |
|[`rm`]({{< relref "/cli/kes-policy/rm" >}})         |Remove a policy                 |
|[`show`]({{< relref "/cli/kes-policy/show" >}})     |Display a policy                |
