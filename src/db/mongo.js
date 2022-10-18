import { MongoClient } from "mongodb"
import { MONGO_DB_URL } from '$env/static/private'

const client = new MongoClient(MONGO_DB_URL)

function startMongo(){
    return client.connect()
}

const clientDb = client.db()

export { clientDb, startMongo }