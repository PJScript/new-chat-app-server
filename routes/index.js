const express = require('express');
const router = express.Router();

const userRouter = require('./api/user/user')
const chatRouter = require('./api/chat/chat')
const adminRouter = require('./api/admin/admin')
router.use('/user', userRouter)
router.use('/chat', chatRouter)
router.use('/admin', adminRouter)
module.exports = router;