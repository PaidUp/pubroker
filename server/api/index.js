import express from 'express'
import bulk from './bulk'
const router = express.Router()

router.use('/bulk', bulk)

export default router
