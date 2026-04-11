const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")

const connectDB = async () => {
    const mongoServer = await MongoMemoryServer.create();
    return await mongoose.connect(mongoServer.getUri(), { dbName: "examcoach_test" }); 
}
module.exports = connectDB
