const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../../../schema/user');

// router.use((req, res, next) => {
//   next();
// });

// 회원 가입
const secret = "hDdlaf!@$da"


router.get('/session', (req,res) => {
  res.status(200).send();
})

router.post('/signup', (req, res) => {
  const { email, password, nickname } = req.body
  console.log(password,"비번")
  const hashed = crypto.createHash("sha512").update(password).digest("base64");
  if(!email || !password || !nickname){
    res.status(404).send('email and password input check')
    return;
  }

  User.findOne({email:email,password:hashed})
  .then((user_data)=>{
    if(user_data){
      res.status(404).send('이미 가입된 이메일 입니다')
    }else{
      User.create({email:email,nickname:nickname,password:hashed,permission:false})
      .then(() => { 
        res.status(200).send() 
      })
    }
  })

    


});


// 로그인
router.post('/login', (req, res) => {
  const {email, password} = req.body
  const hashed = crypto.createHash("sha512").update(password).digest("base64");
  
  User.findOne({email:email,password:hashed,isDeleted:false})
  .then((user_data)=>{
    if(!user_data){
      res.status(401).send('check user email or password!')
    }else{
      if(user_data.permission === false){
        res.status(401).send()
        return;
      }
      req.session.email = user_data.email
      req.session.role = user_data.role
      req.session.save()
      res.status(200).send('login success')
    }
  })
});


router.get('/logout', (req,res) => {
   const { email, role} = req.session

   req.session.destroy();
   res.status(200).send();
})

module.exports = router;