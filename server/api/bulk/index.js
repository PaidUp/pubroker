import express from 'express'
import { auth } from 'pu-common'
import CreditController from '@/controllers/bulk/credit.controller'
import multer from 'multer'
import connect from 'connect'

let uploadMemory = multer({ storage: multer.memoryStorage() })

let combinedMemoryMiddleware = (() => {
  let chain = connect();
  [auth.validate, uploadMemory.single('file')].forEach(middleware => {
    chain.use(middleware)
  })
  return chain
})()

const router = express.Router()
router.post('/credit', combinedMemoryMiddleware, CreditController.bulk)

export default router
