<div align="center"><img alt='Maintenance status: Maintained!' src="https://img.shields.io/maintenance/yes/2016.svg?style=flat-square"><img src="http://elliottcable.s3.amazonaws.com/p/8x8.png"><a href="https://github.com/ELLIOTTCABLE/mocha-before-this/releases"><img alt='Current release of mocha-before-this' src="https://img.shields.io/npm/v/mocha-before-this.svg?style=flat-square&label=semver"></a><img src="http://elliottcable.s3.amazonaws.com/p/8x8.png"><a target="_blank" href="https://npmjs.com/package/mocha-before-this"><img alt='mocha-before-this on the NPM registry' src="https://img.shields.io/npm/dt/mocha-before-this.svg?style=flat-square&label=downloads"></a><img src="http://elliottcable.s3.amazonaws.com/p/8x8.png"><a target="_blank" href="https://travis-ci.org/ELLIOTTCABLE/mocha-before-this"><img alt='CI status' src="https://img.shields.io/travis/ELLIOTTCABLE/mocha-before-this.svg?style=flat-square&label=tests"></a><img src="http://elliottcable.s3.amazonaws.com/p/8x8.png"><a target="_blank" href="https://gemnasium.com/ELLIOTTCABLE/mocha-before-this"><img alt='Dependency status' src="https://img.shields.io/gemnasium/ELLIOTTCABLE/mocha-before-this.svg?style=flat-square&label=deps"></a><img src="http://elliottcable.s3.amazonaws.com/p/8x8.png"><a target="_blank" href="http://ell.io/IRC"><img alt='Chat: IRC on Freenode.net' src="https://img.shields.io/badge/chat-IRC-blue.svg?style=flat-square"></a><img src="http://elliottcable.s3.amazonaws.com/p/8x8.png"><a target="_blank" href="https://twitter.com/intent/follow?screen_name=ELLIOTTCABLE"><img alt='Follow my work on Twitter' src="https://img.shields.io/twitter/follow/ELLIOTTCABLE.svg?style=flat-square&label=%40ELLIOTTCABLE&color=blue"></a></div>
Mocha `beforeThis()`
====================
This monkey-patches [Mocha][] with support for pseudo-hooks specific to a *single test*.

This was extrated from [the library being built](fn) to power <http://FIXME.ninja>; as a component
necessary for [`mocha-directories`](directories) (another hack, to give test-cases their own unique
working directory.)

   [Mocha]: <http://mochajs.org> "Mocha, the javascript test framework for node.js & the browser"
   [fn]: <http://ell.io/tt$fixme-ninja> "The fixme-ninja library on NPM"
   [directories]: <http://ell.io/tt$mocha-directories> "The `mocha-directories` extension"

### Usage

This can be required directly as follows; monkey-patching Mocha's `Test` class for all of your
tests:

    mocha --require 'mocha-before-this/register'

It can also be required from within the test-file (or a test-support file), as follows:

    // ### ES2015 / ES6                            │ // ### JavaScript / ES5
    import patchMocha from 'mocha-before-this'     │ var patchMocha = require('mocha-before-this')
    patchMocha()                                   │ patchMocha()
                                                   │
    // Without globally monkey-patching            │ // Without globally monkey-patching
    import { enableBefores, beforeThis }           │ var patchMocha = require('mocha-before-this')
       from 'mocha-before-this'                    │   , enableBefores = patchMocha.enableBefores
                                                   │   , beforeThis =    patchMocha.beforeThis

`beforeThis()` takes a function, which is then wrapped around the test-body and executed first.

Arguments to `beforeThis()` may be asynchronous *if they return a Promise*. `done()`-function
asynchronicity is not yet supported. If any pseudo-hook returns a Promise, then the entire test-case
becomes asynchronous (although this shouldn't affect your test-case; any synchronous return-value is
preserved.) The pseudo-hooks are run in the same context as the test-case.
