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
  var sheet = jss.createStyleSheet({
    a: a,
    b: {
      extend: a,
      width: '1px'
    }
  }, {named: false})
  ok(sheet.getRule('a'))
  ok(sheet.getRule('b'))
  equal(sheet.toString(), 'a {\n  float: left;\n}\nb {\n  float: left;\n  width: 1px;\n}')
})

test('multi extend', function () {
  var a = {float: 'left'}
  var b = {position: 'absolute'}
  var sheet = jss.createStyleSheet({
    c: {
      extend: [a, b],
      width: '1px'
    }
  }, {named: false})
  ok(sheet.getRule('c'))
  equal(sheet.toString(), 'c {\n  float: left;\n  position: absolute;\n  width: 1px;\n}')
})

test('nested extend', function () {
  var c = {float: 'left'}
  var b = {extend: c, display: 'none'}
  var sheet = jss.createStyleSheet({
    a: {
      extend: b,
      width: '1px'
    }
  }, {named: false})
  ok(sheet.getRule('a'))
  equal(sheet.toString(), 'a {\n  float: left;\n  display: none;\n  width: 1px;\n}')
})

test('extend using rule name', function () {
  var sheet = jss.createStyleSheet({
    a: {float: 'left'},
    b: {
      extend: 'a',
      width: '1px'
    }
  }, {named: false})
  ok(sheet.getRule('a'))
  ok(sheet.getRule('b'))
  equal(sheet.toString(), 'a {\n  float: left;\n}\nb {\n  float: left;\n  width: 1px;\n}')
})

test('error if extend using same rule name', function () {
  var sheet = jss.createStyleSheet({
    a: {
      extend: 'a',
      width: '1px'
    }
  }, {named: false})
  ok(sheet.getRule('a'))
  equal(sheet.toString(), 'a {\n  width: 1px;\n}')
})
