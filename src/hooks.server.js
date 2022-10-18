import { startMongo } from "$db/mongo"
import { createWriteStream } from "fs"

const logFile = "src/db/db.txt"
const stream = createWriteStream(logFile,{flags: "a"})

async function connectToMongoDb(){
    try{
        await startMongo()
    }catch(errors){
        stream.write(`\nError: ${new Date()}: ${errors}`)
    }
}
connectToMongoDb()

// export async function handle({ event, resolve }) {
//     clientAddress = event.getClientAddress()
//     const response = await resolve(event)
//     return response;
// }
