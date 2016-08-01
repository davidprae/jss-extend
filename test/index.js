'use strict'

var jss = window.jss.default

QUnit.module('Extend plugin', {
  setup: function () {
    jss.use(jssExtend.default())
  },
  teardown: function () {
    jss.plugins.registry = []
  }
})

test('simple extend', function () {
  var a = {float: 'left'}
  var ss = jss.createStyleSheet({
    a: a,
    b: {
      extend: a,
      width: '1px'
    }
  }, {named: false})
  ok(ss.rules.a)
  ok(ss.rules.b)
  equal(ss.toString(), 'a {\n  float: left;\n}\nb {\n  float: left;\n  width: 1px;\n}')
})

test('multi extend', function () {
  var a = {float: 'left'}
  var b = {position: 'absolute'}
  var ss = jss.createStyleSheet({
    c: {
      extend: [a, b],
      width: '1px'
    }
  }, {named: false})
  ok(ss.rules.c)
  equal(ss.toString(), 'c {\n  float: left;\n  position: absolute;\n  width: 1px;\n}')
})

test('nested extend', function () {
  var c = {float: 'left'}
  var b = {extend: c, display: 'none'}
  var ss = jss.createStyleSheet({
    a: {
      extend: b,
      width: '1px'
    }
  }, {named: false})
  ok(ss.rules.a)
  equal(ss.toString(), 'a {\n  float: left;\n  display: none;\n  width: 1px;\n}')
})

test('extend using rule name', function () {
  var ss = jss.createStyleSheet({
    a: {float: 'left'},
    b: {
      extend: 'a',
      width: '1px'
    }
  }, {named: false})
  ok(ss.rules.a)
  ok(ss.rules.b)
  equal(ss.toString(), 'a {\n  float: left;\n}\nb {\n  float: left;\n  width: 1px;\n}')
})

test('error if extend using same rule name', function () {
  var ss = jss.createStyleSheet({
    a: {
      extend: 'a',
      width: '1px'
    }
  }, {named: false})
  ok(ss.rules.a)
  equal(ss.toString(), 'a {\n  width: 1px;\n}')
})
