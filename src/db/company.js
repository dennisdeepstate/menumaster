import { clientDb as db } from "$db/mongo"

const companyName = "Test Restaurant"
const companies = db.collection('Companies')

export { companies, companyName }