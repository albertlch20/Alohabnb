const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {

    const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.header("x-auth-token");
    //   const authHeader = req.headers["Authorization"];
    //   const token = authHeader && authHeader.split(" ")[1]; // Bearer Token

    console.log("token:" + token);

    if (!token){

        return res.json({ error: "Token is required for authentication" } );

    }
    
    else{

        try{
            var decoded = jwt.verify(token, 'secretkey');
            console.log(decoded);
            return next();

        } catch(err){
            
            return res.json({ error: "Invalid token" });
        }
    
        
    }

}

module.exports = verifyToken;