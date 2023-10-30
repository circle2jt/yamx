import axios from 'axios'
import { type ElementProxy } from 'src/components/element-proxy'
import { FileTemp } from 'src/libs/file-temp'
import { Testing } from 'src/testing'
import { HttpServer } from './server'

let serve: ElementProxy<HttpServer>
const tmp = new FileTemp()

beforeEach(async () => {
  await Testing.reset()
})

afterEach(async () => {
  await serve.dispose()
  tmp.remove()
})

test('Listen to handle a request', async () => {
  const jobData = { foo: 'bar' }
  serve = await Testing.createElementProxy(HttpServer, {
    address: '0.0.0.0:3001',
    runs: [
      {
        vars: {
          method: '${$parentState.method}',
          body: '${$parentState.body}'
        }
      }
    ]
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setTimeout(async () => {
    await axios.post('http://0.0.0.0:3001', jobData)
    await serve.dispose()
  }, 1000)
  await serve.exec()
  expect(Testing.vars.method).toEqual('POST')
  expect(Testing.vars.body).toEqual(jobData)
})

test('Force quit server', async () => {
  const jobData = { foo: 'bar' }
  serve = await Testing.createElementProxy(HttpServer, {
    address: '0.0.0.0:3002',
    runs: [
      {
        vars: {
          method: '${$parentState.method}',
          body: '${$parentState.body}'
        }
      },
      {
        stop: null
      }
    ]
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setTimeout(async () => {
    try {
      await axios.post('http://0.0.0.0:3002', jobData)
    } catch (err: any) {
      expect(err.response.status).toBe(503)
    }
  }, 1000)
  await serve.exec()
  expect(Testing.vars.method).toEqual('POST')
  expect(Testing.vars.body).toEqual(jobData)
})

test('Check custom authentication', async () => {
  const jobData = { foo: 'bar' }
  serve = await Testing.createElementProxy(HttpServer, {
    address: '0.0.0.0:3003',
    auth: {
      custom: {
        secret: 'SERVER_SECRET_TOKEN',
        secretKey: 'SECRET_HEADER_KEY',
        'verify()': `
          return $parentState.headers[this.secretKey.toLowerCase()] === this.secret
        `
      }
    },
    runs: [
      {
        vars: {
          method: '${$parentState.method}',
          body: '${$parentState.body}'
        }
      }
    ]
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setTimeout(async () => {
    try {
      await axios.post('http://0.0.0.0:3003', jobData)
    } catch (err: any) {
      expect(err.response.status).toBe(401)
    }
    const resp = await axios.post('http://0.0.0.0:3003', jobData, {
      headers: {
        SECRET_HEADER_KEY: 'SERVER_SECRET_TOKEN'
      }
    })
    expect(resp.status).toBe(204)

    await serve.dispose()
  }, 1000)
  await serve.exec()
  expect(Testing.vars.body).toEqual(jobData)
})

test('Check basic authentication via headers', async () => {
  const jobData = { foo: 'bar' }
  serve = await Testing.createElementProxy(HttpServer, {
    address: '0.0.0.0:3003',
    auth: {
      basic: {
        username: 'thanh',
        password: '123'
      }
    },
    runs: [
      {
        vars: {
          method: '${$parentState.method}',
          body: '${$parentState.body}'
        }
      }
    ]
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setTimeout(async () => {
    try {
      await axios.post('http://0.0.0.0:3003', jobData)
    } catch (err: any) {
      expect(err.response.status).toBe(401)
    }
    const resp = await axios.post('http://0.0.0.0:3003', jobData, {
      headers: {
        authorization: `Basic ${Testing.rootScene.globalUtils.base64.encrypt('thanh:123')}`
      }
    })
    expect(resp.status).toBe(204)

    await serve.dispose()
  }, 1000)
  await serve.exec()
  expect(Testing.vars.body).toEqual(jobData)
})

test('Test response', async () => {
  serve = await Testing.createElementProxy(HttpServer, {
    address: '0.0.0.0:3004',
    runs: [
      {
        "exec'js": `
          await new Promise(r => setTimeout(r, 500))
          $parentState.res.writeHead(200)
          $parentState.res.write('ok')
        `
      },
      {
        stop: null
      }
    ]
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setTimeout(async () => {
    const resp = await axios.post('http://0.0.0.0:3004')
    expect(resp.status).toBe(200)
    expect(resp.data).toBe('ok')
  }, 1000)
  await serve.exec()
})
