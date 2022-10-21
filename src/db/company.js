import { clientDb as db } from "$db/mongo"

const companyName = "Test Restaurant"
const companies = db.collection('Companies')
const subUnitLimit = 2
const subGroupLimit = 4

export { companies, companyName, subUnitLimit, subGroupLimit }