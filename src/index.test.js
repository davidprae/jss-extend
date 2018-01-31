/* eslint-disable no-underscore-dangle */

import expect from 'expect.js'
import nested from 'jss-nested'
import expand from 'jss-expand'
import {create} from 'jss'
import Observable from 'zen-observable'

import extend from './index'

const settings = {
  createGenerateClassName: () => rule => `${rule.key}-id`
}

describe('jss-extend', () => {
  let jss
  let warning

  beforeEach(() => {
    extend.__Rewire__('warning', (condition, message) => {
      warning = message
    })
    jss = create(settings).use(
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
      })
    })

    it('should extend', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('b')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        '.a-id {\n' +
        '  float: left;\n' +
        '}\n' +
        '.b-id {\n' +
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
      })
    })

    it('should have correct order', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        '.a-id {\n' +
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
      })
    })

    it('should have correct output', () => {
      expect(sheet.getRule('c')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        '.c-id {\n' +
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
      })
    })

    it('should should have correct output', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        '.a-id {\n' +
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
      })
    })

    it('should have correct output', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        '.a-id {\n' +
        '  width: 1px;\n' +
        '}\n' +
        '.a-id:hover {\n' +
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
      })
    })

    it('should have correct output', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        '.a-id {\n' +
        '  border: 1px solid red;\n' +
        '  width: 2px;\n' +
        '}\n' +
        '.a-id:hover {\n' +
        '  width: 2px;\n' +
        '  height: 2px;\n' +
        '  color: red;\n' +
        '}'
      )
    })
  })

  describe('multi child extend with css state', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        base: {
          '&:hover': {width: '1px'}
        },
        child1: {
          extend: 'base',
          '&:hover': {width: '5px'},
        },
        child2: {
          extend: 'base'
        }
      })
    })

    it('should have correct output', () => {
      expect(sheet.getRule('base')).to.not.be(undefined)
      expect(sheet.getRule('child1')).to.not.be(undefined)
      expect(sheet.getRule('child2')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        '.base-id:hover {\n' +
        '  width: 1px;\n' +
        '}\n' +
        '.child1-id:hover {\n' +
        '  width: 5px;\n' +
        '}\n' +
        '.child2-id:hover {\n' +
        '  width: 1px;\n' +
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
      })
    })

    it('should have correct output', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.getRule('b')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        '.a-id {\n' +
        '  float: left;\n' +
        '}\n' +
        '.b-id {\n' +
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
      })
    })

    it('error if extend using same rule name', () => {
      expect(warning).to.be('[JSS] A rule tries to extend itself \r\n%s')
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        '.a-id {\n' +
        '  width: 1px;\n' +
        '}'
      )
    })
  })

  describe('extend using function values inside function rules without attributes', () => {
    let sheet

    beforeEach(() => {
      const styles = {
        a: () => ({
          height: '200px',
          extend: data => data.redContainer
        })
      }

      sheet = jss.createStyleSheet(styles, {link: true}).attach()

      sheet.update({
        redContainer: {
          background: 'red'
        }
      })
    })

    it('should have correct output', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        '.a-id {\n' +
        '  height: 200px;\n' +
        '  background: red;\n' +
        '}'
      )
    })
  })

  describe('extend using function values inside function rules with data attribute', () => {
    let sheet

    beforeEach(() => {
      const styles = {
        a: data => ({
          height: '200px',
          extend: () => data.redContainer
        })
      }

      sheet = jss.createStyleSheet(styles, {link: true}).attach()

      sheet.update({
        redContainer: {
          background: 'red'
        }
      })
    })

    it('should have correct output', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        '.a-id {\n' +
        '  height: 200px;\n' +
        '  background: red;\n' +
        '}'
      )
    })
  })

  describe('extend using function rules', () => {
    let sheet

    beforeEach(() => {
      const styles = {
        a: data => ({
          height: '200px',
          extend: data.redContainer
        })
      }

      sheet = jss.createStyleSheet(styles, {link: true}).attach()

      sheet.update({
        redContainer: {
          background: 'red'
        }
      })
    })

    it('should have correct output', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      expect(sheet.toString()).to.be(
        '.a-id {\n' +
        '  height: 200px;\n' +
        '  background: red;\n' +
        '}'
      )
    })
  })

  describe('functional extend', () => {
    let sheet

    beforeEach(() => {
      const b = {display: 'block'}
      sheet = jss.createStyleSheet({
        a: {
          extend: data => data.block && b,
          color: 'red',
          '& span': {
            extend: data => data.block && b,
            color: 'blue'
          }
        }
      })
    })

    it('should have correct output', () => {
      expect(sheet.getRule('a')).to.not.be(undefined)
      sheet.update({block: true})
      expect(sheet.toString()).to.be(
        '.a-id {\n' +
        '  color: red;\n' +
        '  display: block;\n' +
        '}\n' +
        '.a-id span {\n' +
        '  color: blue;\n' +
        '  display: block;\n' +
        '}'
      )
      sheet.update({block: false})
      expect(sheet.toString()).to.be(
        '.a-id {\n' +
        '  color: red;\n' +
        '}\n' +
        '.a-id span {\n' +
        '  color: blue;\n' +
        '}'
      )
    })
  })

  describe('support observable value', () => {
    let sheet

    beforeEach(() => {
      sheet = jss.createStyleSheet({
        a: {
          width: new Observable((observer) => {
            observer.next(1)
          })
        }
      })
    })

    it('should generate correct CSS', () => {
      expect(sheet.toString()).to.be(
        '.a-id {\n' +
        '  width: 1;\n' +
        '}'
      )
    })
  })
})
