# jupyterlab-multi-command

![Github Actions Status](https://github.com/philopon/jupyterlab-multi-command/workflows/Build/badge.svg)

## Requirements

* JupyterLab >= 1.0

## Install

```bash
jupyter labextension install @philopon/jupyterlab-multi-command
```

## Demo

format using [jupyterlab_code_formatter](https://github.com/ryantam626/jupyterlab_code_formatter) and save file

![demo](img/demo.gif)

## Contributing

### Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Move to jupyterlab-multi-command directory
# Install dependencies
jlpm
# Build Typescript source
jlpm build
# Link your development version of the extension with JupyterLab
jupyter labextension link .
# Rebuild Typescript source after making changes
jlpm build
# Rebuild JupyterLab after making any changes
jupyter lab build
```

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.

```bash
# Watch the source directory in another terminal tab
jlpm watch
# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch
```

### Uninstall

```bash
jupyter labextension uninstall jupyterlab-multi-command
```

