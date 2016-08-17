# Mapeo Settings Builder

[![npm version][1]][2]
[![js-standard-style][3]][4]

[1]: https://img.shields.io/npm/v/mapeo-settings-builder.svg
[2]: https://www.npmjs.com/package/mapeo-settings-builder
[3]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[4]: http://standardjs.com/

> Build settings file for [Mapeo Desktop](https://github.com/digidem/mapeo-desktop)

When run in a folder of presets, icon files and imagery definitions will create a single settings tarball which can be imported into [Mapeo Desktop](https://github.com/digidem/mapeo-desktop) to configure the application for a particular use-case.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Install

```
npm install --global mapeo-presets-builder
```

Requires node v4 — node v6 support pending [node-mapnik/#634](https://github.com/mapnik/node-mapnik/issues/634#issuecomment-239231520)

## Usage

```sh
# Lint settings
mapeo-settings lint

# Build settings tar file and output to stdout
mapeo-settings build {OPTIONS}
```

Mapeo Presets Builder expects the following file structure in the current directory:

```
├── categories
│   ├── a_category.json
│   ├── other_category.json
│   └── ...
├── fields
│   ├── a_field.json
│   ├── other_field.json
│   └── ...
├── presets
│   ├── preset_category
│   │   ├── a_preset.json
│   │   ├── other_preset.json
│   │   └── ...
│   ├── other_preset_category
│   │   ├── a_preset.json
│   │   ├── other_preset.json
│   │   └── ...
│   ├── uncategorized_preset.json
│   ├── other_uncategorized_preset.json
│   └── ...
├── icons
│   ├── a_icon.svg
│   ├── other_icon.svg
│   └── ...
├── defaults.json
├── imagery.json
└── style.css
```

Where:

- `imagery.json` is an object that should follow the structure defined by [editor-layer-index](https://github.com/osmlab/editor-layer-index/blob/gh-pages/schema.json)
- `style.css` is custom css to override iD css.
- `icons` is a folder of svg images to build a sprite for preset icons
- `categories`, `fields`, `presets`, `defaults.json` see [iD presets](https://github.com/openstreetmap/iD/tree/master/data/presets)

### Options

- `-l, --lang=<langCode>` - the base language of the settings, defaults to `en`.
- `-o, --output=<filename>` - write the settings tarball to this file, if unspecified prints to stdout.


## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © Digital Democracy
