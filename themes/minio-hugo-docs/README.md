# MinIO Hugo Docs Theme

## Config

### Left Nav Heading

You can customize the text that displays at the top of the left navigation by site language.
You can make the text a link and customize where the link points.

#### Link Text

Define the link text in `theme/minio-hugo-docs/assets/i18n/[languageCode].yaml` at the `nav_title` entry.

#### Hyperlink

Define the side nav title link in `config.toml` in the `homeLink` parameter.

```toml
[params]
    homeLink = '/'
```
