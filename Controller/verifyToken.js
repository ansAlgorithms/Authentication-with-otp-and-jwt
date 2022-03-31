const jwt = require('jsonwebtoken')
module.exports = (req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).json({message : `Please Login to see the post`});
    }
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch {
        res.status(401).json({ message: `Invalid token` });
    }
}
