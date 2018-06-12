# Skycoin web client

[![Build Status](https://travis-ci.org/skycoin/skycoin-web.svg?branch=master)](https://travis-ci.org/skycoin/skycoin-web)
[![Known Vulnerabilities](https://snyk.io/test/github/skycoin/skycoin-web/badge.svg)](https://snyk.io/test/github/skycoin/skycoin-web)

The Skycoin web client provides a lite browser wallet, which can be ran from the browser, using a full node exposing selected back-end functions.

## Prerequisites

The Skycoin web interface requires Node 6.9.0 or higher, together with NPM 3 or higher.

## Installation

This project is generated using Angular CLI, therefore it is adviced to first run `npm install -g @angular/cli`.

Dependencies are managed with Yarn, to install yarn run `npm install -g yarn`.

To install all Angular, Angular CLI and all other libraries, you will then have to run `yarn`.

You will only have to run this again, if any dependencies have been changed in the `package.json` file.

## Compiling new target files

To compile new target files, you will have to run: `npm run build`

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. 

## Back-end

As this is a lite client, it requires a back-end to retrieve the blockchain state and inject new transactions. For this
purpose a full node has been set up at `http://128.199.57.221`. At the moment this requires a mapping API, but in the
future any node can do this.

## Cryptography

For security reasons, this wallet does not store the the seeds, neither in the backend nor in the client, so the user must
maintain a backup of them. The seeds are also not transmitted anywhere outside the application code.

To maintain maximum compatibility with Skycoin's original code, the cryptographic functions used by this wallet are in the
[skycoin-lite](https://github.com/skycoin/skycoin-lite) repository, coded in Go (Golang), and are transpiled using gopherjs.
The transpiled code is in the [src/assets/scripts/main.js](/src/assets/scripts/main.js) file, in this repository.

The mnemonic phrases are created using the [bip39 library](https://www.npmjs.com/package/bip39). To create mnemonic phrases
with enough entropy, that library uses the [randombytes library](https://www.npmjs.com/package/randombytes), which uses
[Crypto.getRandomValues()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) for obtaining
cryptographically strong random values. The use of the [bip39 library](https://www.npmjs.com/package/bip39) is limited to
the creation of mnemonic phrases, the code that creates the binary seeds is in
[skycoin-lite](https://github.com/skycoin/skycoin-lite).