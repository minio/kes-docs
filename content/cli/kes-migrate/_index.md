---
title: kes migrate
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

The `kes migrate` command supports migrating master keys from one KMS instance to another KMS instance. 
For example, you can use the command to migrate a Hashicorp Vault instance to another Hashicorp Vault instance. 
Or, `kes migrate` can migrate a Hashicorp Vault instance to or from an AWS Secrets Manager KMS. 

The KMS instances do not need to be of the same type or provider.

The `migrate` command **must** have direct access to **both** KMS instances at the same time. 

## Syntax

```sh
kes migrate         \
    --from <path>   \
    --to <path>     \
    [--force, -f]   \
    [--merge]       \
    [--quiet, -q]   \
    [<pattern>]
```

## Parameters

### `--from`

**Required**

Specify the path to the KES config file for the old KMS (the source) you are moving keys from.

### `--to`

**Required**

Specify the path to the KES config file for the new KMS (the target) you are moving keys to.

### `--force, -f`

_Optional_

Migrate keys to the new KMS even if a key with the same name exists.
The migration process overwrites existing keys on the target server with the keys from the source server when you pass this flag. 

### `--merge`

_Optional_

Preserves keys that exist on the target server and only migrates keys from the old server with names that do not exist on the target server.

### `--quiet, -q`

_Optional_

Disables the progress information from printing.

### `<pattern>`

_Optional_

A text pattern with wildcards to use to find specific keys to migrate.

## Examples

### Migrate All Master Keys

```sh {.copy}
kes migrate --from vault-config.yml --to aws-config.yml
```

### Migrate Some Master Keys

To migrate a subset of all master keys, specify a pattern.
Only master keys that match the pattern migrate.

```sh {.copy}
kes migrate --from <source.yml> --target <target.yml> <pattern>
```

For example:

```sh {.copy}
kes migrate --from source.yml --target target.yml my-key*
```

### Migrate a Single Key

To migrate a single master key, specify the key name.

```sh {.copy}
kes migrate --from <source.yml> --target <target.yml> <key-name>
```

For example: 

```sh {.copy}
kes migrate --from source.yml --target target.yml my-master-key
```