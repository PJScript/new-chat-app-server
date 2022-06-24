const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../../../schema/user');
const Chat = require('../../../schema/chat')



// 회원 가입
const secret = "hDdlaf!@$da"

// 관리자 권한 체크
// router.use('/', (req,res,next) => {
//     const {email, role} = req.session


//     if(!email, !role){
//         res.status(401).send();
//         return;
//     }else if(role !== 'admin'){
//         res.status(401).send()
//     }
//     next();
// })

router.get('/check' , (req,res,next) => {
    const {email, role} = req.session

    if(!email, !role){
        res.status(401).send();
        return;
    }else if(role !== 'admin'){
        res.status(401).send()
    }else{
        res.status(200).send();
    }
    // next();
})

router.post('/rm', (req,res,next) => {
    const { email } = req.body
    User.findOneAndUpdate({email:email}, {isDeleted:true}, {
        new:true
    }).then((data)=>{
      res.status(200).send({data:data})
    })
})

router.post('/permit', (req,res) => {
  const { email } = req.body
  console.log(email,"이메일")

  User.findOneAndUpdate({email:email},{permission:true},{
    new:true
  }).then((data)=>{
    console.log(data)
    res.status(200).send({data:data});
  })
})

router.post('/denied', (req,res) => {
  const { email } = req.body

  User.findOneAndUpdate({email:email},{permission:false},{
    new:true
  }).then((data)=>{
    console.log(data)
    res.status(200).send({data:data})
  })
})


router.get('/permituser', (req,res) => {
    User.find({permission:true, isDeleted:false})
    .then((data)=>{
      res.status(200).send(data)
    })
})


router.post('/role', (req,res,next) => {
    const { email,role } = req.body
    User.findOneAndUpdate({email:email},{role:role},{
        new:true
    }).then((data)=>{
      console.log(data)
      res.status(200).send(data);
    })
})


router.post('/password', (req,res,next) => {
    const { password } = req.body
    const { email,role } = req.session
    console.log(req.session,"세션")

    const secret = "hDdlaf!@$da"
    const hashed = crypto.createHash("sha512").update(password).digest("base64");

    if(role !== 'admin'){
        res.status(401).send('')
        return;
    }

    User.findOneAndUpdate({email:email},{password:hashed},{
        new:true
    }).then((data)=>{
res.status(200).send({data:data})
    })
})

router.get('/denieduser', async (req,res) => {
    User.find({permission:false, isDeleted:false})
    .then((data)=>{
      res.status(200).send(data)
    })
})


router.get('/clearchat', async (req,res) => {
  const totalPost = await Chat.countDocuments({ isDeleted: false })

    // const {email, role} = req.session
    // if(!email || !role || role !== 'admin'){
    //     res.status(401).send();
    //     return;
    // }

    User.findOne({email:'admin'})
    .then((user_data)=>{
      if(user_data.role !== 'admin'){
        res.status(401).send(user_data);
      }else{
        User.updateMany({},{skip_count : totalPost + 1 })
        .then((user_update_data)=>{
            console.log(user_update_data)
          if(user_update_data.acknowledged){
            res.status(200).send(user_update_data);
          }else{
            res.status(404).send("요청 실패 사이트 관리자에게 문의 하세요");
          }
        })
      }
    })

})
router.get('/undochat', async (req,res) => {
    const totalPost = await Chat.countDocuments({ isDeleted: false })

    // const {email, role} = req.session
    // if(!email || !role || role !== 'admin'){
    //     res.status(401).send();
    //     return;
    // }


     User.findOne({email:'admin'})
    .then((user_data)=>{
      if(user_data.role !== 'admin'){
        res.status(401).send();
      }else{
        User.updateMany({},{skip_count:0}).then((user_update_data)=>{
          if(user_update_data.acknowledged){
            res.status(200).send(user_update_data);
          }else{
            res.status(404).send("요청 실패 사이트 관리자에게 문의 하세요");
          }
        })
      }
    })
})




router.post('/create', (req,res,next) => {
  const {email} = req.body

  User.findOneAndUpdate({emai:email},{isDeleted:false},{
    new:true
  }).then((data)=>{
    res.status(200).send({data:data})
  })
})

module.exports = router;