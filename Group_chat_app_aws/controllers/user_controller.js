const User=require('../models/user')
const ChatHistory=require('../models/chatHistory')
const Group=require('../models/group')
const GroupMember=require('../models/group_members')
const bcrypt=require('bcrypt'); 
const jwt=require('jsonwebtoken')
const { Op } = require('sequelize');
const CommonChats=require('../models/common_chats');
const Groupmember = require('../models/group_members');

const getAllUsers= async (req,res,next)=>{
    try{
        const get_users=await User.findAll()
        res.status(200).json({users:get_users})
    }
    catch(err){
        console.log(err)
    }
}

const addUser=async (req,res,next)=>{
    const user_name=req.body.user_name
    const email=req.body.email
    const phone_number=req.body.phone_number
    const pwd=req.body.password
    const saltrounds=5 

    try{
        bcrypt.hash(pwd,saltrounds,async(err,hash)=>{
            let password={pwd:hash}
            const add_user=await User.create({
                user_name:user_name,
                email:email,
                phone_number:phone_number,
                password:password.pwd
            })
            res.status(201).json({message:"User created successfully!!!"})
        })
    }
    catch{

    }
}

function generateAccessToken(id,user_name){
    return jwt.sign({user_id:id,user_name:user_name},'secretkey')
}

const testUser=async (req,res,next)=>{
    const email = req.body.email;
    const pwd=req.body.password;
    const result=await User.findOne({
        where:{'email':email}
    })
    if(result!=null){
        bcrypt.compare(pwd,result.dataValues.password,(err,response)=>{
            if(err){
                res.status(500).send("Something went wrong")
            }
            if(response==true){
                res.status(200).json({message:"User login succesfully",token:generateAccessToken(result.dataValues.id,result.dataValues.user_name)});
            }
            else{
                res.status(401).send("User not authorised");
            }
        })
    }
    else{
        res.status(404).send("User not found");
    }
}

const postMessage=async (req,res,next)=>{
    const user_id=req.body.user_id
    const message=req.body.message
    const grp_name=req.body.group_name
    try{
        const selected_grp=await Group.findOne({
            where:{name:grp_name}
        })
        const post_msg=await ChatHistory.create({
            userId:user_id,
            message:message,
            GroupId:selected_grp.dataValues.id
        })
        res.status(201).json({message:"Message saved successfully!!!"})
    }
    catch(err){
        console.log(err)
        res.status(404).json({message:err})
    }

}

const postCommonMessage=async (req,res,next)=>{
    const user_id=req.body.user_id
    const message=req.body.message
    try{
        const post_msg=await CommonChats.create({
            userId:user_id,
            message:message
        })
        res.status(201).json({message:"Message saved successfully!!!"})
    }
    catch(err){
        console.log(err)
        res.status(404).json({message:err})
    }
}

const getAllMessages=async (req,res,next)=>{
    try{
        const fetch_all_msgs=await CommonChats.findAll({
            include: [
                {
                    model:User,
                    attibutes: ['id','name', 'message', 'date_time']
                }
            ],
            order: [['date_time', 'ASC']],
        })
        const chats = fetch_all_msgs.map((ele) => {
            return {
                messageId: ele.dataValues.id,
                message: ele.dataValues.message,
                name: ele.dataValues.user.dataValues.user_name,
                userId: ele.dataValues.userId,
                date_time: ele.dataValues.date_time
            }
        })
        const all_chat=await chats
        console.log(all_chat)
        res.status(200).json({messages:all_chat})
    }
    catch(err){
        console.log(err)
        res.status(404).json({message:err})
    }
}

const addGroup=async(req,res,next)=>{
    const grp_name=req.body.name
    const users=req.body.users
    const admin_id=req.body.admin_id
    try{
        const grp=await Group.create({
            'name':grp_name,
            'AdminId':admin_id
        })
        const grp_members=await grp.addUsers(users.map((ele)=>{
            return Number(ele)
        }))
        return res.status(200).json({ grp, message: "Group is succesfylly created" })
    }
    catch(err){
        console.log(err)
        res.status(404).json({message:err})
    }

}

const getAllGroups=async(req,res,next)=>{
    try{
        const user=req.user
        const rel_user_list=[]
        const related_grps=await GroupMember.findAll({
            where:{userId:user}
        })
        related_grps.forEach(element => {
            rel_user_list.push(element.dataValues.GroupId)
        });
        const all_grps=await Group.findAll({
            where:{
                id:{
                    [Op.in]:rel_user_list
                }
            }
        })
        res.status(200).json({groups:all_grps})
    }
    catch(err){
        console.log(err)
        res.status(404).json({message:err})
    }
}

const getGroupMessages=async (req,res,next)=>{
    try{
        const group=req.query.group
        const selected_grp_id=await Group.findOne({
            where:{name:group}
        })
        const fetch_all_msgs=await ChatHistory.findAll({
            include: [
                {
                    model:User,
                    attibutes: ['id','name', 'message', 'date_time']
                }
            ],
            order: [['date_time', 'ASC']],
            where:{GroupId:selected_grp_id.dataValues.id}
        })
        const chats = fetch_all_msgs.map((ele) => {
            return {
                messageId: ele.dataValues.id,
                message: ele.dataValues.message,
                name: ele.dataValues.user.dataValues.user_name,
                userId: ele.dataValues.userId,
                date_time: ele.dataValues.date_time
            }
        })
        const all_chat=await chats
        console.log(all_chat)
        res.status(200).json({messages:all_chat})

    }
    catch(err){
        console.log(err)
        res.status(404).json({message:err})
    }
}

const getGroupDetails=async (req,res,next)=>{
    const group_name=req.query.name
    try{
        const get_group=await Group.findOne({
            where:{
                name:group_name
            }
        })
        const get_members=await Groupmember.findAll({
            where:{
                GroupId:get_group.dataValues.id
            }
        })
        const user_id_list=[]
        get_members.forEach((ele)=>{
            user_id_list.push(ele.dataValues.userId)
        })
        res.status(200).json({group:get_group.dataValues,members:user_id_list})
    }
    catch(err){
        console.log(err)
        res.status(404).json({message:err})
    }
}

const editGroup=async(req,res,next)=>{
    const id=req.params.id
    const grp_name=req.body.name
    const users=req.body.users
    const admin_id=req.body.admin_id
    try{
        const selected_grp=await Group.findOne({
            where:{id:id}
        })
        const grp=await selected_grp.update({
            'name':grp_name,
            'AdminId':admin_id
        })
        const remove_members=await grp.addUsers(null)
        const grp_members=await grp.addUsers(users.map((ele)=>{
            return Number(ele)
        }))
        return res.status(200).json({ grp, message: "Group is succesfylly Updated" })
    }
    catch(err){
        console.log(err)
        res.status(404).json({message:err})
    }
}

module.exports={
    getAllUsers,
    addUser,
    testUser,
    postMessage,
    getAllMessages,
    addGroup,
    getAllGroups,
    getGroupMessages,
    postCommonMessage,
    getGroupDetails,
    editGroup
}