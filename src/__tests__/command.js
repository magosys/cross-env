const isWindowsMock = require('../is-windows')
const commandConvert = require('../command')

jest.mock('../is-windows')

const env = {
  test: 'a',
  test1: 'b',
  test2: 'c',
  test3: 'd',
  // eslint-disable-next-line babel/camelcase
  empty_var: '',
}

afterEach(() => {
  jest.clearAllMocks()
})

test(`converts unix-style env variable usage for windows`, () => {
  isWindowsMock.mockReturnValue(true)
  expect(commandConvert('$test', env)).toBe('%test%')
})

test(`converts unix-style non-existing env variable usage for windows`, () => {
  isWindowsMock.mockReturnValue(true)
  expect(commandConvert('${not_here}', env)).toBe('')
})

test(`converts unix-style non-existing env variable usage to default`, () => {
  isWindowsMock.mockReturnValue(true)
  expect(commandConvert('${not_here:4}', env)).toBe('4')
})

test(`converts unix-style existing env variable usage ignoring default`, () => {
  isWindowsMock.mockReturnValue(false)
  expect(commandConvert('${test1:4}', env)).toBe('${test1}')
})

test(`converts unix-style existing env variable and non-existing with default to windows`, () => {
  isWindowsMock.mockReturnValue(true)
  expect(commandConvert('${test1:3} ${non_existing:4} ${test2:5} ${what:6}', env)).toBe('%test1% 4 %test2% 6')
})

test(`converts unix-style existing env variable and non-existing with default`, () => {
  isWindowsMock.mockReturnValue(false)
  expect(commandConvert('${test1:3} ${non_existing:4} ${test2:5} ${what:6}', env)).toBe('${test1} 4 ${test2} 6')
})


test(`converts unix-style existing env variable usage ignoring default to windows style`, () => {
  isWindowsMock.mockReturnValue(true)
  expect(commandConvert('${test1:4}', env)).toBe('%test1%')
})

test(`leaves command unchanged when not a variable`, () => {
  expect(commandConvert('test', env)).toBe('test')
})

test(`doesn't convert windows-style env variable`, () => {
  isWindowsMock.mockReturnValue(false)
  expect(commandConvert('%test%', env)).toBe('%test%')
})

test(`leaves variable unchanged when using correct operating system`, () => {
  isWindowsMock.mockReturnValue(false)
  expect(commandConvert('$test', env)).toBe('$test')
})

test(`is stateless`, () => {
  // this test prevents falling into regexp traps like this:
  // http://stackoverflow.com/a/1520853/971592
  isWindowsMock.mockReturnValue(true)
  expect(commandConvert('$test', env)).toBe(commandConvert('$test', env))
})

test(`converts embedded unix-style env variables usage for windows`, () => {
  isWindowsMock.mockReturnValue(true)
  expect(commandConvert('$test1/$test2/$test3', env)).toBe(
    '%test1%/%test2%/%test3%',
  )
})

// eslint-disable-next-line max-len
test(`leaves embedded variables unchanged when using correct operating system`, () => {
  isWindowsMock.mockReturnValue(false)
  expect(commandConvert('$test1/$test2/$test3', env)).toBe(
    '$test1/$test2/$test3',
  )
})

test(`converts braced unix-style env variable usage for windows`, () => {
  isWindowsMock.mockReturnValue(true)
  // eslint-disable-next-line no-template-curly-in-string
  expect(commandConvert('${test}', env)).toBe('%test%')
})

test(`removes non-existent variables from the converted command`, () => {
  isWindowsMock.mockReturnValue(true)
  expect(commandConvert('$test1/$foo/$test2', env)).toBe('%test1%//%test2%')
})

test(`removes empty variables from the converted command`, () => {
  isWindowsMock.mockReturnValue(true)
  expect(commandConvert('$foo/$test/$empty_var', env)).toBe('/%test%/')
})

test(`normalizes command on windows`, () => {
  isWindowsMock.mockReturnValue(true)
  // index.js calls `commandConvert` with `normalize` param
  // as `true` for command only
  expect(commandConvert('./cmd.bat', env, true)).toBe('cmd.bat')
})
