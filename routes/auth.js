const router = require('express').Router();
const controller = require('../Controller/controller.js')
const verify = require('../Controller/verifyToken')

router.post('/register', controller.register)
router.post('/login', controller.login)
router.post('/verify', controller.verify)
router.delete('/:email', controller.delete)
router.get('/posts',verify, controller.posts)

module.exports = router;