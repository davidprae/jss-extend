/* eslint-disable no-underscore-dangle */

import expect from 'expect.js'
import nested from 'jss-nested'
import expand from 'jss-expand'
import {create} from 'jss'

import extend from '.'

describe('jss-extend', () => {
  let jss
  let warning

  beforeEach(() => {
    extend.__Rewire__('warning', (condition, message) => {
      warning = message
    })
    jss = create().use(
      extend(),
      nested(),
      expand()
    )
  })

  afterEach(() => {
    extend.__ResetDependency__('warning')
    warning = undefined
  })

  describe('simple extend', () => {
    let sheet

    beforeEach(() => {
      const a = {float: 'left'}
      sheet = jss.createStyleSheet({
        a,
        b: {
          extend: a,
          width: '1px'
        }
      }, {named: false})
    })

    it('should extend', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('b')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  float: left;\n' +
        '}\n' +
        'b {\n' +
        '  float: left;\n' +
        '  width: 1px;\n' +
        '}'
      )
    })
  })

  describe('ensure override order', () => {
    let sheet

    beforeEach(() => {
      const a = {
        float: 'left',
        color: 'red'
      }
      sheet = jss.createStyleSheet({
        a: {
          extend: a,
          float: 'right'
        }
      }, {named: false})
    })

    it('should have correct order', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  float: right;\n' +
        '  color: red;\n' +
        '}'
      )
    })
  })

  describe('multi extend', () => {
    let sheet

    beforeEach(() => {
      const a = {float: 'left'}
      const b = {position: 'absolute'}
      sheet = jss.createStyleSheet({
        c: {
          extend: [a, b],
          width: '1px'
        }
      }, {named: false})
    })

    it('should have correct output', () => {
      expect(sheet.getRule('c')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        'c {\n' +
        '  float: left;\n' +
        '  position: absolute;\n' +
        '  width: 1px;\n' +
        '}'
      )
    })
  })

  describe('nested extend 1', () => {
    let sheet

    beforeEach(() => {
      const c = {float: 'left'}
      const b = {extend: c, display: 'none'}
      sheet = jss.createStyleSheet({
        a: {
          extend: b,
          width: '1px'
        }
      }, {named: false})
    })

    it('should should have correct output', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  float: left;\n' +
        '  display: none;\n' +
        '  width: 1px;\n' +
        '}'
      )
    })
  })

  describe('nested extend 2', () => {
    let sheet

    beforeEach(() => {
      const b = {
        '&:hover': {
          float: 'left',
          width: '3px'
        }
      }
      sheet = jss.createStyleSheet({
        a: {
          extend: b,
          width: '1px',
          '&:hover': {
            width: '2px',
            height: '2px'
          }
        }
      }, {named: false})
    })

    it('should have correct output', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  width: 1px;\n' +
        '}\n' +
        'a:hover {\n' +
        '  float: left;\n' +
        '  width: 2px;\n' +
        '  height: 2px;\n' +
        '}'
      )
    })
  })

  describe('deep nested extend', () => {
    let sheet

    beforeEach(() => {
      const a = {
        '&:hover': {width: '5px', height: '5px'},
        border: {width: '3px'}
      }
      const b = {
        extend: a,
        '&:hover': {width: '4px'},
        border: {color: 'blue'}
      }
      const c = {
        extend: b,
        '&:hover': {height: '2px'}
      }
      const d = {
        extend: c,
        '&:hover': {width: '2px'}
      }
      sheet = jss.createStyleSheet({
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
    })

    it('should have correct output', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  border: 1px solid red;\n' +
        '  width: 2px;\n' +
        '}\n' +
        'a:hover {\n' +
        '  width: 2px;\n' +
        '  height: 2px;\n' +
        '  color: red;\n' +
        '}'
      )
    })
  })

  describe('extend using rule name', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {float: 'left'},
        b: {
          extend: 'a',
          width: '1px'
        }
      }, {named: false})
    })

    it('should have correct output', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('b')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  float: left;\n' +
        '}\n' +
        'b {\n' +
        '  float: left;\n' +
        '  width: 1px;\n' +
        '}'
      )
    })
  })

  describe('extend using rule name', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {
          extend: 'a',
          width: '1px'
        }
      }, {named: false})
    })

    it('error if extend using same rule name', () => {
      expect(warning).to.be('[JSS] A rule tries to extend itself \r\n%s')
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        'a {\n' +
        '  width: 1px;\n' +
        '}'
      )
    })
  })
})
