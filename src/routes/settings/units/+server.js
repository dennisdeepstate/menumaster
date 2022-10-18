import { clientDb as db } from "$db/mongo"
import { verifyUnit } from "$lib/verifyInput"

class UnitOfMeasure{
    constructor(unit, name, type, conversion, isActive = true){
        this.unit = unit,
        this.name = name,
        this.type = type,
        this.conversion = conversion,
        this.isActive = isActive
    }
}

const companyName = "Test Restaurant"
const companies = db.collection('Companies')
const units = db.collection('Units')
let response = {
    status: 500,
    message: {error:"an error occured on the server"}
}

async function findAllUnits(){
    const customUnits = await companies.findOne({name: companyName}, { projection: { _id: false, units: true} })
    const globalUnits = await units.find({}, { projection: { _id: false} }).toArray()
    return {globalUnits: globalUnits , customUnits: customUnits.units}
}
async function findOneCustomUnitByName(unitName){
    const data = await findAllUnits()
    return data.customUnits.find(customUnit => customUnit.name === unitName.toLowerCase())
}
async function findOneUnit(unit){
    const data = await findAllUnits()
    return data.globalUnits.find(globalUnit => globalUnit.unit === unit.toLowerCase())
}
async function findOneUnitByName(unitName){
    const data = await findAllUnits()
    return data.globalUnits.find(globalUnit => globalUnit.name === unitName.toLowerCase())
}

export async function GET({ url }) {
    response.status = 200
    let unit = url.searchParams.get('unit') ?? ''
    unit.trim()
    const find = url.searchParams.get('find') ?? ''
    if(find === "all"){
        response.message = {success: await findAllUnits()}
    }else if(find === "one"){
        const foundUnit = await findOneCustomUnitByName(unit)
        const msg = foundUnit ? { success: foundUnit }: { fail :'unit not found' }
        response.message = msg
    }else{
        response.status = 403
        response.message = {error: "find parameter not defined"}
    }
    return new Response(JSON.stringify(response.message),{status: response.status})
}
export async function POST({ url }) {
    let newUnitAlias = url.searchParams.get('unit') ?? ''
    newUnitAlias.trim().toLowerCase()
    let newUnitType = url.searchParams.get('type') ?? ''
    newUnitType.trim().toLowerCase()
    let newUnitConversion = url.searchParams.get('conversion') ?? '0'
    newUnitConversion = parseFloat(newUnitConversion.trim())
    let newUnitParent = url.searchParams.get('parent') ?? ''
    newUnitParent.trim().toLowerCase()

    const newUnit = new UnitOfMeasure(newUnitAlias, `${newUnitAlias}*${newUnitConversion}_${newUnitParent}`, newUnitType, newUnitConversion)
    const errors = verifyUnit(newUnit)

    if(errors.length === 0){
        if((!await findOneCustomUnitByName(newUnit.name)) && (!await findOneUnit(newUnit.unit))){
            const parent = await findOneCustomUnitByName(newUnitParent) || await findOneUnitByName(newUnitParent)
            if(parent && parent.type === newUnit.type){
                await companies.updateOne({name: companyName},{$push : {units: newUnit }})
                response.status = 200
                response.message = { success: newUnit }
            }else{
                response.status = 403
                response.message = {error: `The unit's parent does not exist`}
            } 
        }else{
            response.status = 403
            response.message = {error: `The unit (${newUnit.unit}) with a (${newUnit.conversion}x) conversion to the unit (${newUnitParent}) already exists`}
        }
    }else{
        response.status = 403
        response.message = {error: errors} 
    }

    return new Response(JSON.stringify(response.message),{status: response.status})
}
export async function PUT({ url }) {
    const unitName = url.searchParams.get('unit') ?? ''
    let isActive = url.searchParams.get('active') ?? ''
    isActive = isActive === "false" ? false : true
    if(await findOneCustomUnitByName(unitName)){
        await companies.updateOne({name: companyName, "units.name" : unitName },{$set: {"units.$.isActive": isActive} })
        response.status = 200
        response.message = {success: `${unitName} is ${isActive ? '' : 'no longer'} active`}
    }else{
        response.status = 403
        response.message = {error: `the unit (${unitName}) does not exist`}
    }

    return new Response(JSON.stringify(response.message),{status: response.status})
}