import { clientDb as db } from "$db/mongo"

const companyName = "Test Restaurant"
const companies = db.collection('Companies')
const subUnitLimit = 2
const subGroupLimit = 4
const user = 'D Rurac'

export { companies, companyName, user, subUnitLimit, subGroupLimit }