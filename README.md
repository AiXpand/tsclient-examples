# AiXpand Network TypeScript client usage examples

Welcome to the repository intended to showcase the usage of AiXpand Network's TypeScript client.

## Prerequisites

Keep in mind that this project is built using typescript and nodejs.
Make sure you have the latest [NodeJS](https://nodejs.org/en) installed on your machine.

To check whether NodeJS is successfully installed, type the following commands in the CLI:

```
$ node --version
v18.16.0
```

To check that the Node Package Manager is successfully installed, type:

```
$ npm --version
9.6.6
```

[Typescript](https://www.typescriptlang.org/) is a superset of JavaScript that provides additional syntax to vanilla JavaScript. In order for the TypeScript code to become JavaScript, it needs to be transpiled. This operation is done by the TypeScript packages available for installation with:
```
$ npm install -g typescript 
```

After TypeScript is installed, check whether the packages have been successfully deployed and linked, by typing the following in the CLI:

```
$ tsc --version
Version 5.0.4
```

## Project setup

Take a look at the `.env.example` file and create an `.env` file of a similar structure.

Now that the prerequisites have been installed and the `.env` file configured, run the following command in your computer's CLI, making sure you're inside the project root directory:

```
$ npm install
```

This will install all the dependencies of these example projects, including the `@aixpand/client` package. It is now time to transpile the TypeScript sources and copying all the assets into `./dist` by running the following command in the CLI:

```
$ npm run build
```

## Executing the first example

The first example is a simple connection to the network followed by the subscription to the Heartbeat event stream. Run:

```
$ node dist/example01/index.js
```

That's it. Now the client will connect to the network and listen for the `AIXPAND_NODE` declared in the `.env` file. It will also chart the network, based on the witnessed heartbeats.