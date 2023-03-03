---
title: kes identity of
date: 2023-03-03
lastmod: :git
draft: false
tableOfContents: true
---

## Overview

Returns the identity of either an api key or a certificate.

## Syntax

Return the identity from an api-key:
```sh
kes identity of <api-key>
```

Return the identity from a certificate:
```sh
kes identity of <path-to-certificate>
```

## Parameters

`kes identity of` takes no additional parameters.
Supply either the api key or the path of a certificate.

## Examples

Obtain the identity from an API key:

```sh
kes identity of kes:v1:ACQpoGqx3rHHjT938Hfu5hVVQJHZWSqVI2Xp1KlYxFVw
```

Obtain the identity from a certificate:

```sh
kes identity of client.crt
```