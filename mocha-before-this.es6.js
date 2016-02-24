/* @flow */
import Debug from 'debug'
const debug = Debug('mocha-before-this')

import { Test } from 'mocha'
import _        from 'lodash'

declare function before() : any
declare function after() : any


// This monkey-patches `beforeThis`-ish functionality into Mocha: `needs()` will register a `before`
// hook onto the `Test` instance *itself*, specific to that `Test`. (Doesn't work as a fully-fledged
// Mocha `Hook`.)
//
// Of note, if any of the hooks returns a Promise, then the test *becomes* an asynchronous test;
// eventually returning a promise that fulfills with the synchronous return-value of the body.
//---
// TODO: This *should* be a library that actually extends Mocha with a new `Runnable`/`Hook`, on
//       `Test` instead of on `Suite`, but ... whatever.
// FIXME: This assumes the `Test` is already Promise-based. Support explicit-async (with `done`) and
//        synchronous (no arguments, doesn't return a promise.)
const enableBefores = function enableBefores(a_test: ?Test) : Test {
   const self          = null == a_test ? this : a_test
       , parent        = self.parent
       , original_body = self.fn

   if (null == self._before)
      self._before = []

   if (null == self.fn._callsBefores) {
      self.fn = function callBefores(...args : Array<any>) : Promise {

         const defer = to => {
            if (self._hasBecomeAsync) return Promise.resolve(to.apply(this, args))
            else                      return to.apply(this, args)
         }

         if (self._before.length > 0) {
            const next = self._before.shift()
                , rv   = next.apply(this, args)

            if (rv && typeof rv.then == 'function'){
               self._hasBecomeAsync = true
               return rv.then( ()=> callBefores.apply(this, args) )
            } else return defer(callBefores)
         } else return defer(original_body)

      }
      self.fn._callsBefores = true
   }

   if (null == self.beforeThis)
      Object.defineProperty(self, 'beforeThis', {
         enumerable: false
       , value: beforeThis
      })

   return self
}

const beforeThis = function beforeThis(...fns: Array<()=>any>) : Test {
   if (null == this.fn._callsBefores)
      this.enableBefores()

   this._before.push(...fns)

   return this
}

export { enableBefores, beforeThis }
patchMocha.enableBefores = enableBefores
patchMocha.beforeThis    = beforeThis

export default function patchMocha() : void {
   _.assign(Test.prototype, patchMocha)
}
