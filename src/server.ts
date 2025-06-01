import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { AngularAppEngine } from '@angular/ssr'
import { join } from 'path'

const app = express()
const angularAppEngine = new AngularAppEngine()

// Ensure PORT is a number
const PORT = parseInt(process.env['PORT'] || '4000', 10)
const DIST_FOLDER = join(process.cwd(), 'dist', 'secure-messenger')

console.log(`Starting server setup...`)
console.log(`Using port: ${PORT}`)
console.log(`Static files served from: ${join(DIST_FOLDER, 'browser')}`)

// Serve static files from browser folder
app.use(express.static(join(DIST_FOLDER, 'browser')))

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  console.log(`Health check received from ${req.ip}`)
  res.json({ status: 'Server is running', port: PORT })
})

// Handle all other routes with Angular SSR
app.get('*', async (req, res) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`)

  try {
    // Create the request URL
    const url = new URL(req.originalUrl, `${req.protocol}://${req.get('host')}`)
    console.log(`Constructed URL for SSR: ${url.toString()}`)
    
    // Create a proper Request object for Angular SSR
    const request = new Request(url.toString(), {
      method: req.method,
      headers: new Headers(req.headers as Record<string, string>),
    })

    // Handle the request with Angular SSR engine
    const response = await angularAppEngine.handle(request)

    if (!response) {
      console.warn(`No SSR response generated for ${req.originalUrl}`)
      res.status(404).send('Page not found')
      return
    }

    // Set status and headers
    res.status(response.status)
    
    // Copy headers from Angular response
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    // Send the response body
    const body = await response.text()
    console.log(`SSR response generated with status ${response.status}`)
    res.send(body)

  } catch (error) {
    console.error('SSR Error:', error)
    res.status(500).send('Internal Server Error')
  }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

export default app
