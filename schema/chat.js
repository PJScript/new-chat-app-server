const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema; 



const chatSchema = new mongoose.Schema({
  id:ObjectId,
  message:String,
  img_url:{type:String,default:null},
  room:{type:String,default:'normal'},
  user_id:{type:ObjectId,ref:'User'},
  count:{type:Number},
  created_at:{type:Date, default:Date.now()},
  updated_at:{type:Date, default:Date.now()},
  deleted_at:{type:Date, default:null},
  isDeleted:{type:Boolean, default:false},
});
module.exports = mongoose.model('Chat', chatSchema);