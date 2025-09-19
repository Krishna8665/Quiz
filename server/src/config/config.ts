import {config} from 'dotenv';
config()

 const envConfig = {
    portNumber : process.env.PORT,
    mongodbString : process.env.MONGODB_URL,
     JWT_SECRET : process.env.JWT_SECRET,
     
}

export default envConfig;