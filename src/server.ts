import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { AngularAppEngine } from '@angular/ssr'
import { getContext } from '@netlify/angular-runtime/context.mjs'

const app = express()
const angularAppEngine = new AngularAppEngine()

const PORT = process.env['PORT'] || 5000  // <-- fixed here

app.get('*', async (req, res) => {
  try {
    const url = req.protocol + '://' + req.get('host') + req.originalUrl
    const fetchRequest = new Request(url, {
      method: req.method,
      headers: req.headers as any,
      body: req.method === 'GET' || req.method === 'HEAD' ? null : req,
      redirect: 'manual'
    })

    const context = getContext()
    const response = await angularAppEngine.handle(fetchRequest, context)

    if (!response) {
      res.status(404).send('Not found')
      return
    }

    res.status(response.status)

    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    const responseBody = await response.text()
    res.send(responseBody)

  } catch (err) {
    console.error('SSR error:', err)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
