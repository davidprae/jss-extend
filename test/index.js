'use strict'

var jss = window.jss.default

QUnit.module('Extend plugin', {
  setup: function () {
    jss.use(jssExtend.default())
    jss.use(jssNested.default())
    jss.use(jssExpand.default())
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

test('ensure override order', function () {
  var a = {
    float: 'left',
    color: 'red'
  }
  var sheet = jss.createStyleSheet({
    a: {
      extend: a,
      float: 'right'
    }
  }, {named: false})
  ok(sheet.getRule('a'))
  equal(sheet.toString(), 'a {\n  float: right;\n  color: red;\n}')
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

test('nested extend 1', function () {
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

test('nested extend 2', function () {
  var b = {
    '&:hover': {
      float: 'left',
      width: '3px'
    }
  }
  var sheet = jss.createStyleSheet({
    a: {
      extend: b,
      width: '1px',
      '&:hover': {
        width: '2px',
        height: '2px'
      }
    }
  }, {named: false})
  ok(sheet.getRule('a'))
  equal(sheet.toString(), 'a {\n  width: 1px;\n}\na:hover {\n  float: left;\n  width: 2px;\n  height: 2px;\n}')
})

test('deep nested extend', function () {
  var a = {
    '&:hover': {width: '5px', height: '5px'},
    border: {width: '3px'}
  }
  var b = {
    extend: a,
    '&:hover': {width: '4px'},
    border: {color: 'blue'}
  }
  var c = {
    extend: b,
    '&:hover': {height: '2px'}
  }
  var d = {
    extend: c,
    '&:hover': {width: '2px'}
  }
  var sheet = jss.createStyleSheet({
    a: {
      extend: d,
      width: '2px',
      border: {
        width: '1px',
        color: 'red',
        style: 'solid'
      },
      '&:hover': {
        color: 'red'
      }
    }
  }, {named: false})
  ok(sheet.getRule('a'))
  equal(sheet.toString(), 'a {\n  border: 1px solid red;\n  width: 2px;\n}\na:hover {\n  width: 2px;\n  height: 2px;\n  color: red;\n}')
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
