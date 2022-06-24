const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors')
const server = http.createServer(app);
const session = require('express-session');      
const Memorystore = require('memorystore')(session)
const connect = require('./public/mongoose')
const apiRouter = require('./routes/index')
const nodeschedule = require('node-schedule');



app.use(express.json({
    limit: '10mb'
  }))
  app.use(express.urlencoded({
    limit: '10mb',
    extended: false
  }))
app.use(cors({
     methods: ['GET', 'POST'],
    // origin:'http://rudydy.xyz',
    origin:'http://localhost:3000',
    credentials: true,
}))

let maxAge = 600 * 1000  // 2분
const sessionObj = {
    secret: "wegf6124@#$@#!",  // salt -> 암호화를 할 때 필요한 요소값
    resave: true,
    saveUninitialized: true,
    store: new Memorystore({ checkPeriod: maxAge }),  // 서버를 저장할 공간 설정, 
    // checkPeriod : 서버쪽 세션의 유효기간
    rolling: true,  // 서버에 특정 요청 시 rolling하여 기한 연장
    cookie: {
    maxAge: maxAge,
    httpOnly : true,
    }
    // 브라우저 쿠키의 유효기간
}

app.use(session(sessionObj))
app.use('/api',apiRouter)



const io = require("socket.io")(server, {
  cors: {
      origin: "*",
      Credential: true,
  }
})


app.get('/' , (req,res) => {
  res.status(200).send('Hello World')
})

let connect_socket
let target_room = 'normal'
io.on('connection', (socket) => {
  connect_socket = socket

  socket.on('user-info',(data) => {
    socket.join('normal');
    io.sockets.to(socket.id).emit("user-info",`user join room: normal`)
  })
  
  socket.on('message', ({email,message,room}) => {
    io.to(room).emit('broadcast-message',  {
      email:email,
      message:message,
      created_at:new Date(),
    })
  })

  socket.on('img', ({email,message,room,img_url}) => {
    io.to(room).emit('broadcast-image',  {
      email:email,
      message:message,
      img_url:img_url,
      created_at:new Date(),
    })
  })

  socket.on("disconnect", () => {
    console.log("a user disconnect")
  })
});

          // 초 분 시간 일 월 
const rule = '0 0  * * 1'







server.listen(8080,() => {
  connect()
  // const job = nodeschedule.scheduleJob('10 * * * *', function(){
  //   console.log('The answer to life, the universe, and everything!');
  //   // io.to(target_room).emit('broadcast-message',  {
  //   //   email:'system date',
  //   //   created_at:new Date(),
  //   // })
  // });
    console.log('server on 8080')
})


// 소켓 리스너 
// connection, disconnect, message: {id, msg, } 