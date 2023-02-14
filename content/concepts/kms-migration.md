---
title: KMS Migration
date: 2023-02-08
draft: false
---

This guide explains some concepts and best practices about migrating keys stored at the KMS.

- [Concepts](#concepts)
- [Best Practices](#best-practices)

```
                      ╔═══════════════════════════════════════════════╗
                      ║                               ┌───────────┐   ║
                      ║                      ╭────────┤   KMS 1   │   ║
┌────────────┐        ║  ┌────────────┐      │        └───────────┘   ║
│ KES Client ├────────╫──┤ KES Server ├──────┤⇅                       ║
└────────────┘        ║  └────────────┘      ┊        ┌───────────┐   ║
                      ║                      ╰┄┄┄┄┄┄┄┄┤   KMS 2   │   ║
                      ║                               └───────────┘   ║                  
                      ╚═══════════════════════════════════════════════╝
```

***

### Concepts

In general, a KES server is connected to a KMS which acts as persistent and secure key store.
The KES server stores all master keys at the KMS. However, sometimes it is necessary to move
from one KMS instance to another one - for example when moving from a cloud service to a on-prem
solution. In such a case, some or all master keys must be migrated to the new KMS instance. While
it may be possible to do that manually with KMS-specific tooling we don't recommend doing such a
migration by hand.

Migrating the master keys is a very critical operation. Migrating individual keys by hand increases
the risk of exposing or loosing a master key. Therefore, the KES CLI provides a migration command:
```
$ kes migrate --help
Usage:
    kes migrate [options] [<pattern>]

Options:
    --from <PATH>            Path to the KES config file of the migration source.
    --to   <PATH>            Path to the KES config file of the migration target.

    -f, --force              Migrate keys even if a key with the same name exists
                             at the target. The existing keys will be deleted.

    --merge                  Merge the source into the target by only migrating
                             those keys that do not exist at the target.

    -q, --quiet              Do not print progress information.
    -h, --help               Print command line options.

Examples:
    $ kes migrate --from vault-config.yml --to aws-config.yml
```

The `migrate` command supports migrating master keys from an arbitrary KMS instance
to another arbitrary KMS instance. For example, it can migrate a Hashicorp Vault instance
to another Hashicorp Vault instance. However, it can also migrate a Hashcorp Vault instance
to e.g. AWS SecretsManager and vice versa. So, the KMS instances don't need to be of the
same type.

There is one important restriction, though. The `migrate` command has to have direct access to
both KMS instances at the same time. For instance, given that the source KMS is running at 
`A` and the target KMS is running at `B` then the `migrate` command needs to be run at `C` which
can directly access `A` as well as `B`:
```

A┌─────────────┐            B┌─────────────┐
 │    KMS 1    │             │    KMS 2    │  
 └──────┬──────┘             └──────┬──────┘
        │↓                          │↑
        └────────────┬──────────────┘
                    ↓│↑
             C┌──────┴──────┐
              │   migrate   │
              └─────────────┘
```

### Best Practices

To minimize the risk of errors during the migration process the following best practices should be followed:

1. Ensure that the source as well as the target KMS are in a healthy state.
2. Verify that the KES configuration for both, the source and target KMS, are valid and
   that your KES servers can access their KMS instance. In particular, the following command
   starts a KES server successfully:
   ```sh
   kes server --config <your-config-file.yml>
   ```
3. If you can access the the KES servers as root or if your policy allows [listing keys](https://github.com/minio/kes/wiki/Server-API#List-Keys) you can list the keys that should be migrated via:
   ```sh
   export KES_SERVER=https://<KES-endpoint>
   export KES_CLIENT_KEY=<your-private-key>
   export KES_CLIENT_CERT=<your-certificate>

   kes key list
   ```
   > You can also list the keys at the target KMS by specifying the env. variables for the KES
   > server that is connected to the target KMS. You may already have keys there.
4. Once your ready you can then start the migration process. Therefore, you need the KES config
   files for the source and target KMS instances. Now, you have to decide whether you want to
   migrate all keys, a subset of keys or just a single key. 
   - For migrating all master keys run the following command:
     ```
     kes migrate --from <source.yml> --target <target.yml>
     ```
   - If you want to just migrate a subset of all master keys you can specify a pattern.
     Only master keys that match the pattern will be migrated:
     ```
     kes migrate --from <source.yml> --target <target.yml> <pattern>
     ```
     > For example: `kes migrate --from source.yml --target target.yml my-key*`
   
   - You can also migrate just a single master key by specifying the exact key name:
     ```
     kes migrate --from <source.yml> --target <target.yml> <key-name>
     ```
     > For example: `kes migrate --from source.yml --target target.yml my-master-key`

*** 

By default, the `migrate` command will not overwrite any existing key at the target KMS and will 
report an error if it cannot migrate a key from the source to the target. However, you can overwrite
existing keys as part of the migration using the `--force` flag. Note that overwriting a master key
will erase the previous key.

Instead of overwriting existing keys at the target KMS, you can also merge the source KMS into the
target using `--merge` flag. Note that `--merge` only migrates master keys that don't exist at the
target KMS. However, if two keys (one at the source and one at the target KMS) have the same name
but different values then `--merge` will **not** migrate the key. Therefore, `--merge` should only
be used when repeating a migration attempt or when doing the migration in batches using patterns.

If you are not sure how to do a migration or whether your migration plan is sound you can either
practice first using two local [KES + FS deployments](https://github.com/minio/kes/wiki/Filesystem-Keystore)
or [contact us](https://min.io/pricing).