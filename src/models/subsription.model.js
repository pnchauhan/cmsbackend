import mongoose,{mongo, Schema} from 'mongoose';

const SubsciptionSchema=new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps:true});

const Subcription=mongoose.model('Subcription', SubsciptionSchema)