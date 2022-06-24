const express = require('express');
const router = express.Router();
const multer = require("multer");
const AWS = require('aws-sdk')
require('dotenv').config()
const Page = require('../../../utils/pagenation')

const Chat = require('../../../schema/chat')
const User = require('../../../schema/user')

// const S3_BUCKET ='onlyimagebucket0710';
// const REGION ='ap-northeast-2';
// const ACCESS_KEY ='AKIA5NJMYOAU7TUHZMXX';
// const SECRET_ACCESS_KEY ='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';


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region : process.env.AWS_REGION
});



// router.use((req, res, next) => {
//   console.log(req.session)
//   if(!req.session.email || req.session.email === undefined || !req.session){
//     res.status(404).send('session expired')
//     return;
//   }
//   next();
// });

// router.use('/' , (req,res,next) => {
//   const {email} = req.session
//   if(!email){
//     res.status(401).send();
//     return;
//   }
//   next();

//   })

  
router.post('/', async (req, res) => {
  console.log(req.body, "바디")
  const { email } = req.session
  const { message, room } = req.body
  const totalPost = await Chat.countDocuments({ isDeleted: false })

  // console.log(message,room,"메세지 룸")
  User.findOne({ email: email })
    .then((user_data) => {
      if (user_data) {
        Chat.create({ message: message, user_id: user_data._id,count:totalPost+1, created_at: new Date() })
          .then((data) => {
            console.log(data, "db insert")
            res.status(200).send("db insert success")
          })
      } else {
        res.status(404).send('can not find email')
      }
    })
})

// 이전 채팅 50개 가져오기
router.get('/prevchat', (req, res) => {
  const email = req.session.email
  console.log(email)
  User.findOne({ email: email })
    .then((user_data) => {
      console.log(user_data)
      if (!user_data) {
        res.status(404).send('not found user')
      } else {
        let skip_count = user_data.skip_count
        Chat.find({}).populate('user_id').skip(skip_count).sort({ _id: -1 }).limit(50)
          .then((data) => {
            let fix_data = JSON.parse(JSON.stringify(data))
            for (let i = 0; i <= data.length - 1; i++) {
              fix_data[i].user_id.password = ""
              fix_data[i]["email"] = fix_data[i].user_id.email
              fix_data[i]["nickname"] = fix_data[i].user_id.nickname
            }
            fix_data.reverse();

            res.status(200).send({ data: fix_data, email: email });
          })
      }
    })

});

router.get('/test', (req, res) => {
  User.findOneAndUpdate({email:"admin"},{skip_count:0},{
    new:true
  }).then((data)=>{
res.status(200).send(data)
  })
})


// 채팅 n개 요청
router.get('/morechat', async (req, res) => {
  const { email } = req.session
  const { page } = req.query
  console.log(req.session,"세션")
  if(!email){
    res.status(404).send("이메일 없음");
    return;
  }
  console.log(page)
  const totalPost = await Chat.countDocuments({ isDeleted: false })
  const { hidePost, max } = Page.paging(page, totalPost, 50)
  User.findOne({email:email})
  .then((user_data)=>{
  
    const skip_count = user_data.skip_count
    console.log(user_data.skip_count,"스킵 카운트")
    console.log(totalPost,"길이")
    Chat.find({count:{$gte:user_data.skip_count+1}})
    .sort({ _id: -1 })
    .skip(hidePost)
    .limit(max)
    .populate('user_id')
    .then((data) => {
      let fix_data = JSON.parse(JSON.stringify(data))


      for (let i = 0; i <= data.length - 1; i++) {

        fix_data[i].user_id.password = ""
        fix_data[i]["email"] = fix_data[i].user_id.email
        fix_data[i]["nickname"] = fix_data[i].user_id.nickname


      }
      fix_data.reverse();

      res.status(200).send({ data: fix_data, email: email })

    })
  })

  


})



router.get('/removechat', async (req, res) => {
  const { email,role } = req.session
  const totalPost = await Chat.countDocuments({ isDeleted: false })
  console.log(typeof(totalPost))
  User.findOneAndUpdate({email:email},{skip_count:totalPost},{
    new:true
  })
  .then((data) => {
    res.status(200).send(data)
  })
})


// router.get('/prevchat', (req,res) => {
//   res.status(200).send()
// })
const upload = multer({})
router.post('/image',upload.single('image'), async (req, res) => {
  console.log("test")
  const {email} = req.session
  const totalPost = await Chat.countDocuments({ isDeleted: false })
  console.log(totalPost,"totalPost")
  const param = {
    'Bucket':'onlyimagebucket0710',
    'Key': `${Date.now().toString()}${req.file.originalname}`,
    'ACL':'public-read',
    'Body':req.file.buffer,
    // 'ContentType':'image/png'
  }
  let date = new Date()
    s3.upload(param,(err,result)=>{
        console.log("업로드 시작")
      if(err){
          console.log(err)
          return;
      }

      User.findOne({ email: email })
    .then((user_data) => {
      if (user_data) {
        Chat.create({ message: 'image', img_url:result.Location, count:totalPost+1, user_id: user_data._id, created_at: new Date() })
          .then((data) => {
            console.log(data, "db insert")
            res.status(200).send({email:user_data.email,message:'image',img_url:data.img_url,created_at:data.crated_at})
          })
      } else {
        res.status(404).send('can not find email')
      }
    })
      
      console.log(result.Location,"success 200")
    })

});

module.exports = router;