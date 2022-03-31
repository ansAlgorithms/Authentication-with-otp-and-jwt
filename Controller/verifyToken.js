const jwt = require('jsonwebtoken')
module.exports = (req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.json({message : `Please Login to see the post`});
    }
    else{
        const verified = jwt.verify(token,process.env.TOKEN_SECRET);
        req.user = verified;
        next()
        if(verified===false) res.json({message : `Invalid token`})
    }
}