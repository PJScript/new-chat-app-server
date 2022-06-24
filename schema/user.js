const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema; 


const imgSchema = new mongoose.Schema({
  id:ObjectId,
  url:{type:String,default:null}
})

const userSchema = new mongoose.Schema({
  id:ObjectId,
  email:{type:String,unique: true, lowercase: true},
  img:imgSchema,
  nickname:String,
  role:{type:String,default:'user'},
  password:{type:String,trim: true},
  permission:Boolean,
  skip_count:{type:Number,default:0},
  created_at:{type:Date, default:Date.now()},
  updated_at:{type:Date, default:Date.now()},
  deleted_at:{type:Date, default:null},
  isDeleted:{type:Boolean, default:false},
});
module.exports = mongoose.model('User', userSchema);

