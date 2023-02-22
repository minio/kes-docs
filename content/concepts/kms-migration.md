---
title: KMS Migration
date: 2023-02-08
lastmod: :git
draft: false
tableOfContents: true
---


```goat
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

## Concepts

In general, a KES server connects to a Key Management Service (KMS)
The KMS acts as persistent and secure key store.
The KES server stores all master keys at the KMS.

### Migrating KMS Instances

A few situations require that you move from one KMS instance to another one, such as moving from a cloud service to an on-premises solution. 
In such cases, you must migrate some or all master keys to the new KMS instance.

While it may be possible to do that manually with KMS-specific tooling, we do not recommend doing such a such a critical operation as a key migration by hand.
Migrating individual keys by hand increases the risk of exposing or losing a master key. 

Instead, the KES CLI provides a migration command, `kes migrate`:

```sh
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

The `migrate` command supports migrating master keys from one KMS instance to another KMS instance. 
For example, you can use the command to migrate a Hashicorp Vault instance to another Hashicorp Vault instance. 
Or, `kes migrate` can migrate a Hashicorp Vault instance to or from an AWS Secrets Manager KMS. 
The KMS instances don't need to be of the same type or provider.

The `migrate` command **must** have direct access to **both** KMS instances at the same time. 
For instance, if the source KMS runs at `A` and the target KMS runs at `B`, then run the `migrate` command from `C` which can directly access both `A` and `B`:

```goat
A .-----------.            B .-----------.
 |    KMS 1    |            |    KMS 2    |  
  '-----+-----'              '------+----'
       ↓|                           |↑
         +----------. .------------+
                    ↓|↑
             C .-----+-----.
              |   migrate   |
               '-----------'
```

## Best Practices

To minimize the risk of errors during the migration process, follow these best practices:

1. Ensure a healthy state for both the source and the target KMS.
2. Verify valid KES configurations for both the source and target KMS 
3. Verify that each KES server can access their KMS instance. 
   In particular, check that the following command starts a KES server successfully:
   ```sh
   kes server --config <your-config-file.yml>
   ```
4. If your user permissions allow [listing keys](https://github.com/minio/kes/wiki/Server-API#List-Keys) or you have `root` access, you can list the keys that should be migrated via:
 
   ```sh
   export KES_SERVER=https://<KES-endpoint>
   export KES_CLIENT_KEY=<your-private-key>
   export KES_CLIENT_CERT=<your-certificate>

   kes key list
   ```
   
   **Tip:** You can also list the keys at the target KMS by specifying the environment variables for the KES server connected to the target KMS. 
   You may already have keys there.

5. Have the prepared KES config files for the source and target KMS instances.

### Migrate Keys

#### Migrate All Master Keys

The following command migrates all keys from the source server to the target server.

```
kes migrate --from <source.yml> --target <target.yml>
```

#### Migrate Some Master Keys

To migrate a subset of all master keys, specify a pattern.
Only master keys that match the pattern migrate.

```
kes migrate --from <source.yml> --target <target.yml> <pattern>
```

For example:

```
kes migrate --from source.yml --target target.yml my-key*
```
   
#### Migrate a Single Key

To migrate a single master key, specify the key name.

```
kes migrate --from <source.yml> --target <target.yml> <key-name>
```

For example: 

```
kes migrate --from source.yml --target target.yml my-master-key
```

## Behavior 

### Existing Keys on Target

#### Overwrite Keys

By default, the `migrate` command does not overwrite existing keys at the target KMS.
Instead, the command reports an error if it cannot migrate a key from the source to the target. 

Use the `--force` flag to overwrite existing keys as part of the migration. 

**Caution:** Overwriting a master key erases the previous key!

#### Merge Keys

Instead of overwriting existing keys at the target KMS, you can also merge the source KMS into the target KMS using `--merge` flag. 

**Note:** `--merge` only migrates master keys that do not exist at the target KMS. 

If the source and the target KMS each have keys with the same name but different values, `--merge` does **not** migrate the key. 
Only use `--merge` when repeating a migration attempt or doing the migration in batches using patterns.

## Getting Migration Help

Before performing a live migration, consider getting assistance for this critical procedure.

1. Practice first using two local [KES + FS deployments](https://github.com/minio/kes/wiki/Filesystem-Keystore) 
2. [Contact us](mailto:hello@min.io?subj=KES migration)