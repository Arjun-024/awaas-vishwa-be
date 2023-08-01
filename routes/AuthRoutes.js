const express = require('express')
const router = express.Router()
const { registerUser } = require('../controller/AuthControllers')

router.post('/register', registerUser)

module.exports = router