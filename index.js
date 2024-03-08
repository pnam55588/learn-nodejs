const express = require("express")
const PORT = 3000
const app = express()
const AWS = require("aws-sdk")
require('dotenv').config()
const path = require("path")
const multer = require("multer")
const { log } = require("console")
const e = require("express")

app.use(express.urlencoded({ extended: true }))
app.use(express.static("./view"))

app.set('view engine', "ejs")
app.set("views", "./views")

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
})
const S3 = new AWS.S3()
const db = new AWS.DynamoDB.DocumentClient()

const bucketName = process.env.S3_BUCKET_NAME
const tableName = process.env.DYNAMODB_TABLE_NAME

// config multer
const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
    if (file.mimetype.split('/')[0] === 'image') {
        cb(null, true);
    } else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
    }
}
const upload= multer({ storage: storage, fileFilter: imageFilter, limits: { fileSize: 1024 * 1024 * 2 } }); 

const uploadImage = async (file) => {
    const params = {
        Bucket: bucketName,
        Key: `${Date.now()}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read"
    }
    return await S3.upload(params).promise()
}

app.get('/' ,async (req, res) => {
    try{
        const params = {
            TableName: tableName
        }
        const data = await db.scan(params).promise()
        res.render("index", {products : data.Items})
    }catch(err){
        console.log(err)
    }
})
app.post('/add', upload.single("image"), async (req, res) => {
    try{
        const id = (Number(req.body.id) || 0)
        const name = req.body.name || ""
        const amount = (Number(req.body.price) || 0)
        const image = req.body.image || null
        console.log("test: ", req.file);
        // const product = {
        //     id: id,
        //     name: name,
        //     amount: amount,
        //     image: image
        // }
        // if(image){
        //     const data = await uploadImage(image)
        //     product.image = data.Location
        // }
        // const params = {
        //     TableName: tableName,
        //     Item: product
        // }
        // await db.put(params).promise()
        res.redirect("/")
    }catch(err){
        console.log(err)
    }
    
})


app.listen(PORT, () => {
    console.log("port: ", PORT);
})