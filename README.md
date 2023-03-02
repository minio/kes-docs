# MinIO's Key Encryption Service (KES) Documentation

The KES docs use [Hugo](https://www.gohogo.io) to generate static HTML pages.

- [MinIO's Key Encryption Service (KES) Documentation](#minios-key-encryption-service-kes-documentation)
  - [Prerequisites](#prerequisites)
  - [Initial Setup](#initial-setup)
  - [Build Preview](#build-preview)
  - [Style](#style)
    - [Markup](#markup)
    - [Style Guides](#style-guides)
    - [Spelling](#spelling)
  - [Shortcodes](#shortcodes)
    - [Internal linking](#internal-linking)
    - [Admonitions](#admonitions)
  - [Frontmatter](#frontmatter)


## Prerequisites

- Any [operation system that Hugo supports](https://gohugo.io/installation/)
- [nodejs](https://nodejs.org/en/download/package-manager/) 14.5.0 or later
- [Node Package Manager](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed (8.5.0 or later)
- [Hugo installed](https://gohugo.io/installation/) (0.110.0 or later)

## Initial Setup

1. Clone this repository
2. cd to the directory
3. Run `npm install`

## Build Preview

You can launch a live preview of the site as you work.

1. From your terminal in the repository folder, run

   ```shell
   npm start
   ```
2. In your browser, go to `localhost:1313`

## Style

### Markup

We write in [Goldmark Markdown](https://github.com/yuin/goldmark/) as extended by [Hugo shortcodes](https://gohugo.io/content-management/shortcodes/) and our own [shortcodes](#shortcodes).

Goldmark is fully [Commonmark](https://commonmark.org/help/) compliant.

### Style Guides

MinIO uses an internal style guide.
Allow maintainers to modify your branch when you submit your PR so that we can adjust for internal style consistencies.

Otherwise, follow the following resources in order of preference:

1. [MongoDB Style Guide](https://www.mongodb.com/docs/meta/style-guide/quickstart/)
2. [ASD-STE-100 Simplified Technical English](https://asd-ste100.org/STE_downloads.html#features16-x)
3. [Google Developer Style Guide](https://developers.google.com/style/)

### Spelling

We write in American English, using [Merriam Webster's online dictionary](https://www.merriam-webster.com/) as the standard spelling reference.

## Shortcodes

Hugo uses shortcodes to extend what is normally available with Markdown.

### Internal linking

To link to another page within the docs, use the following format.

```Markdown
[link text]({{< relref "path/to/page/#heading" >}})
```

### Admonitions

We have added a shortcode that supports four admonition types

- Note
- Tip
- Caution
- Warning

```Markdown
{{< admonition title="Admonition title" type="[note | tip | caution | warning]" >}}
Text...
{{< /admonition >}}
```

The admonition title (`title="Admonition title"`) is optional.

```Markdown
{{< admonition title="Warning: Data loss!" type="warning" >}}
Using this command causes data loss. 
Use with caution.
{{< /admonition >}}
```

## Tabs

Tabbed-view navigation is supported using the following shortcode.

```
{{< tabs "uniqueid" >}}
{{< tab "tab 1 title" >}} 
  tab 1 Content 
{{< /tab >}}
{{< tab "tab 2 title" >}} 
  tab 2 Content 
{{< /tab >}}
...
{{< /tabs >}}
```

Pleaste note that the `uniqueid` must be unique for each tab group.

## Frontmatter

We use YAML-formatted [front matter](https://gohugo.io/content-management/front-matter/).

<!---
We need to implement cascading front matter.
See https://gohugo.io/content-management/front-matter/#front-matter-cascade.
-->

Pages should have at least the following front matter tokens:

```yaml
---
title: <Page Title>
date: YYYY-MM-DD ## date of file creation
lastmod: :git ## this is retrieved from git and should not be modified
draft: false ## set to true if the document is not yet ready for publication
tableOfContents: true ## creates a right-side page navigation TOC, set to `false` if not needed
---
```