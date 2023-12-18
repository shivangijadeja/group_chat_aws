const jwt=require('jsonwebtoken')

const authenticate=(req,res,next)=>{
    try{
        const token=req.header('Authorization');
        const user = jwt.verify(token,'secretkey');
        req.user=user.user_id
        next();
    }
    catch(err){
        console.log(err)
        return res.status(401).json({success:false})
    }
    
    
}

module.exports={
    authenticate
}