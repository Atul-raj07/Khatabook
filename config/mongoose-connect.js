const mongoose = require("mongoose")

mongoose.connect('mongodb://localhost:27017/khatabook')
.then(()=>{
    
})
.catch((err)=>{
    console.log(err)
})

const db = mongoose.connection

module.exports = db