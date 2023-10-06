import express from "express"
import colors from "colors"
import dotenv from 'dotenv'
import morgan from "morgan"
import connectDB from "./config/db.js"
import userRoutes from './routes/userRoutes.js'
import blogPostRoutes from './routes/blogPostRoutes.js'
import cors from 'cors'
//configure env
dotenv.config({ path: './.env' })

//database config
connectDB();

//rest object
const app = express()

//middlewares
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

//routes
app.use('/api/user',userRoutes)
app.use('/api/post',blogPostRoutes)

//rest api
app.get('/',(req,res)=>{
    res.send({
        message:'welcome to app'
    })
})

//port
const PORT=process.env.PORT || 4000;

//run listen
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`.bgGreen.white)
})