import { server } from './server.js'

const connectionDetails = await server()

console.info(`
Paste the following code into https://codepen.io/pen/?editors=0012 or similar:

(async function main ()  {
  console.info('Create session')
  const transport = new WebTransport('${connectionDetails.address}', {
    serverCertificateHashes: [${connectionDetails.serverCertificateHashes.map(cert => `{
      algorithm: '${cert.algorithm}',
      value: Uint8Array.from(atob('${btoa(String.fromCodePoint(...cert.value))}'), (m) => m.codePointAt(0))
    }`)}]
  })

  console.info('Wait for session')
  await transport.ready
  console.info('Session ready')

  console.info('Create bidi stream')
  const stream = await transport.createBidirectionalStream()
  const reader = stream.readable.getReader()

  const writer = stream.writable.getWriter()
  writer.closed.catch(err => {
    console.error('Writer closed with error', err.name, err.message, err.code, err.stack)
  })

  let bytes = 0

  try {
    while (true) {
      const res = await reader.read()

      if (res.done) {
        console.info('Read stream finished')
        break
      }

      console.info('Bytes', bytes)
      bytes += res.value.byteLength
    }

    console.info('Received', bytes, 'bytes of 268435456')
  } catch (err) {
      console.error('Read errored', err.name, err.message, err.code, err.stack)
  }
})()
`)

// keep process running
setInterval(() => {}, 1000)
