import mongoose from "mongoose"
import * as dotenv from 'dotenv'
dotenv.config()

const db_connection = async ()=>{
    mongoose.set('strictQuery', true)

    const conn = await mongoose.connect(`${process.env.DB_URI}`)
    .then(() => console.log('DB Connected... :)'))
    .catch((err)=>console.log(err))

    return conn
}

export default db_connection