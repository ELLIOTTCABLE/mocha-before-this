import Debug from 'debug'
const debug = Debug('mocha-before-this:tests')

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import sinonAsPromised from 'sinon-as-promised'

const should  = chai.should()
                chai.use(chaiAsPromised)
                chai.use(sinonChai)

declare function before() : any
declare function after() : any


import mocha_before_this from '../mocha-before-this.es6.js'
import { Suite, Test } from 'mocha'

describe("Mocha beforeThis hooks", function(){
   describe("Test::enableBefores()", function(){
      
      var a_test, a_body
      beforeEach(function(){
         a_body = sinon.spy()
         a_test = new Test('foo', a_body)
         a_test.enableBefores = mocha_before_this.enableBefores
      })

      it("exists", function(){
         should.exist(mocha_before_this.enableBefores)
         should.exist(a_test.enableBefores)
      })

      it("doesn't throw", function(){
         ~function(){ a_test.enableBefores() }.should.not.throw()
      })

      it("throws when there is no test body", function(){
         const a_test = new Test()

         ~function(){ mocha_before_this.enableBefores(a_test) }.should.throw()
      })

      it("doesn't throw when called multiple times", function(){
         a_test.enableBefores()
         ~function(){ a_test.enableBefores() }.should.not.throw()
      })

      // Ew.
      const globalEnableBefores = 'undefined' === typeof enableBefores ? undefined : enableBefores
          , globalBeforeThis    = 'undefined' === typeof beforeThis    ? undefined : beforeThis
      it("doesn't stomp on any existing Mocha functionality", function(){
         const a_test = new Test('foo', ()=>{})

         should.not.exist(a_test.enableBefores)
         should.not.exist(a_test.beforeThis)
         should.not.exist(a_test._before)
         should.not.exist(a_test._hasBecomeAsync)
         should.not.exist(a_test.fn._callsBefores)
         should.not.exist(globalEnableBefores)
         should.not.exist(globalBeforeThis)
      })

      it("ensures the test exposes beforeThis", function(){
         should.not.exist(a_test.beforeThis)

         a_test.enableBefores()
         should.exist(a_test.beforeThis)
      })

      it("wraps the existing test-body function", function(){
         a_test.fn.should.equal(a_body)

         a_test.enableBefores()
         a_test.fn.should.not.equal(a_body)
      })

      it("doesn't wrap the body multiple times", function(){
         a_test.enableBefores()
         const original_wrapper = a_test.fn

         a_test.enableBefores()
         a_test.fn.should.equal(original_wrapper)
      })

      describe("- a wrapped test", function(){
         it("calls the original test-body in the absence of hooks", function(){
            a_test.enableBefores()
            a_test.fn.should.not.equal(a_body)
            a_test.fn()
            a_body.should.have.been.calledOnce
         })

         it("passes arguments along to the original test-body", function(){
            const an_arg = new Object
            a_test.enableBefores()

            a_test.fn.should.not.equal(a_body)
            a_test.fn(an_arg)
            a_body.should.have.been.calledOnce
            a_body.should.have.been.calledWithExactly(an_arg)
         })

         it("calls the original test-body with the same context", function(){
            const the_context = new Object
            a_test.enableBefores()

            a_test.fn.should.not.equal(a_body)
            a_test.fn.call(the_context)
            a_body.should.have.been.calledOnce
            a_body.should.have.been.calledOn(the_context)
         })

         it("causes added before-hooks to be called", function(){
            const a_hook = sinon.spy()
            a_test.enableBefores()

            a_test.beforeThis(a_hook)
            a_test._before.should.include(a_hook)

            a_test.fn()
            a_hook.should.have.been.calledOnce
         })

         it("calls multiple before-hooks", function(){
            const first = sinon.spy(), second = sinon.spy()
            a_test.enableBefores()

            a_test.beforeThis(first)
            a_test.beforeThis(second)
            a_test._before.should.include(first)
            a_test._before.should.include(second)

            a_test.fn()
            first.should.have.been.calledOnce
            second.should.have.been.calledOnce
         })

         it("calls multiple asynchronous before-hooks *sequentially*", function(done){
            var called = false
            a_test.enableBefores()

            const first = sinon.spy(function first(){ return new Promise((resolve, reject) => {
               debug("First promise called")
               setTimeout(function(){
                  debug("First promise resolving")
                  called = true
                  resolve(called)
               }, 25)
            }) })

            const second = sinon.spy(function second(){
               debug("Second promise called")
               called.should.be.true
            })

            debug("Registering hooks")
            a_test.beforeThis(first)
            a_test.beforeThis(second)

            const rv = a_test.fn()
            rv.should.be.an.instanceof(Promise)
            rv.then(result => {
               first.should.have.been.calledOnce
               second.should.have.been.calledOnce
            }).should.notify(done)
         })

         it("still calls the original body after any hooks", function(){
            const hook = sinon.spy()
            a_test.enableBefores()

            a_test.beforeThis(hook)
            a_test.fn()
            a_body.should.have.been.calledOnce
         })

         it("returns synchronously if there are no hooks", function(){
            const a_body = sinon.stub().returns()
                , a_test = new Test('foo', a_body)
            mocha_before_this.enableBefores(a_test)

            const rv = a_test.fn()
            should.not.exist(rv)
         })

         it("returns synchronously when all hooks are synchronous", function(){
            const a_body = sinon.stub().returns()
                , first  = sinon.stub().returns()
                , second = sinon.stub().returns()
                , a_test = new Test('foo', a_body)
            mocha_before_this.enableBefores(a_test)

            a_test.beforeThis(first)
            a_test.beforeThis(second)
            const rv = a_test.fn()
            should.not.exist(rv)
         })

         it("still returns asynchronously when the body is asynch", function(){
            const a_body = sinon.stub().resolves()
                , first  = sinon.stub().returns()
                , second = sinon.stub().returns()
                , a_test = new Test('foo', a_body)
            mocha_before_this.enableBefores(a_test)

            a_test.beforeThis(first)
            a_test.beforeThis(second)
            const rv = a_test.fn()
            should.exist(rv)
            should.exist(rv.then)
            return rv.should.be.fulfilled
         })

         it("retains the return-value of the body with synchronous hooks", function(){
            const something = new Object
                , a_body = sinon.stub().returns(something)
                , a_hook = sinon.spy()
                , a_test = new Test('foo', a_body)
            mocha_before_this.enableBefores(a_test)

            a_test.beforeThis(a_hook)
            const rv = a_test.fn()
            should.exist(rv)
            rv.should.equal(something)
         })

         it("still returns the synchronous return-value of the body when it becomes asynch", function(){
            const something = new Object
                , a_body = sinon.stub().returns(something)
                , first  = sinon.stub().resolves()
                , second = sinon.stub().resolves()
                , a_test = new Test('foo', a_body)
            mocha_before_this.enableBefores(a_test)

            a_test.beforeThis(first)
            a_test.beforeThis(second)
            const rv = a_test.fn()
            return rv.should.eventually.be.equal(something)
         })
      })

   })
}) // Mocha
