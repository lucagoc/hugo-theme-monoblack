# ❯ monoblack

A pure black minimalist terminal theme for [Hugo](https://gohugo.io/).

## Installation

### Git Submodule

Inside your Hugo site repository:

```bash
git submodule add https://github.com/lucagoc/hugo-theme-monoblack.git themes/monoblack
```

### Hugo Modules

Initialize Hugo module and import `monoblack`:

```bash
hugo mod init github.com/yourusername/yourblog
```

In your `hugo.toml`:

```toml
[module]
  [[module.imports]]
    path = "github.com/lucagoc/hugo-theme-monoblack"
```

## Configuration

Add the following to your `hugo.toml`:

```toml
baseURL = 'https://example.com/'
locale = 'en-us'
title = 'user@example.com'
theme = 'monoblack'

[markup.highlight]
  style = 'github-dark'
  noClasses = true
  guessSyntax = true

[params]
  author = 'Your Name'
  description = 'Notes, systems & code experiments'
  accentColor = 'random' # or a fixed hex color like '#00f0ff'
  terminalUser = 'blog'
  terminalHost = 'example.com'
  showReadingTime = true
  footerText = 'ദ്ദി ᗜˬᗜ✧' # Set to false to disable

  # Optional Giscus Comments
  [params.giscus]
    enable = false
    repo = 'username/repository'
    repoId = 'R_...'
    category = 'General'
    categoryId = 'DIC_...'
    mapping = 'pathname'
    theme = 'transparent_dark'
    lang = 'en'
    lazy = true
```

## License

Distributed under the [MIT License](LICENSE).
