const express=require('express')
require('dotenv').config();
const cors=require('cors')
const app=express()
const sequelize=require('./utils/database')
const PORT=process.env.PORT || 8000

app.use(cors({
    origin:"*",
    methods:["GET","POST"]
}))

app.use(express.json())
app.use(express.static('views'));
app.use(express.json({extended:false}))

const userRoute=require('./routes/user_routes')
const User=require('./models/user')
const Groups=require('./models/group')
const GroupMember=require('./models/group_members')
const ChatHistory=require('./models/chatHistory')
const CommonChats=require('./models/common_chats')

app.use(userRoute)

app.get('/',(req,res)=>{
    res.sendFile("sign_up.html",{root:'views'})
})

app.get('/chat',(req,res)=>{
    res.sendFile("chat.html",{root:'views'})
})

User.hasMany(ChatHistory)
ChatHistory.belongsTo(User)
User.hasMany(CommonChats)
CommonChats.belongsTo(User)
User.belongsToMany(Groups, { through: GroupMember });
Groups.belongsToMany(User, { through: GroupMember });
Groups.belongsTo(User,{foreignKey: 'AdminId',constraints:true,onDelete:'CASCADE'})
Groups.hasMany(ChatHistory);
ChatHistory.belongsTo(Groups);

sequelize
.sync(
    // { force: true }
    )
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`SERVER IS RUNNING ON ${PORT}`)
    })
})
