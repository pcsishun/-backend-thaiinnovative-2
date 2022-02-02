const jwt = require('jsonwebtoken');

const config = process.env;

const verifyToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'] 
    // console.log(token)

    if(!token){
        const replyText = {
            statusLogin: false,
            text:"please login to access this pages."
        }
        return res.status(403).send(replyText)
    }

    try{
        const decoded = jwt.verify(token, config.TOKEN_KEY)
        // console.log(config.TOKEN_KEY)
        req.user = decoded
        // console.log(req.user)
    }catch(err){
        const replyText = {
            statusLogin: false,
            text:"please login to access this pages."
        }
        return res.status(401).send(replyText)
    }

    return next();
}


module.exports = verifyToken