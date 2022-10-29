import { companyName, units, findAllUnits, findAllActiveUnits, findEligibleUnitParents, findOneCustomUnitByName, findOneUnitByName } from "$db/find"
import { verifyUnit } from "$lib/verifyInput"
import { subUnitLimit } from "$db/company"

class UnitOfMeasure{
    constructor(unit, name, type, conversion, author=companyName, isActive = true){
        this.unit = unit,
        this.name = name,
        this.type = type,
        this.conversion = conversion,
        this.author = author,
        this.isActive = isActive
    }
}

let response = {
    status: 500,
    message: {error: ["an error occured on the server"]}
}

export async function GET({ url }) {
    let unitName = url.searchParams.get('name') ?? ''
    unitName = unitName.trim().toLowerCase()
    const find = url.searchParams.get('find') ?? ''
    if(find === "all"){
        const foundUnits = await findAllUnits()
        response.status = 200
        response.message = foundUnits ? {success: foundUnits} : {fail: 'units not found'}
    }else if(find === "active"){
        const foundUnits = await findAllActiveUnits()
        response.status = 200
        response.message = foundUnits ? {success: foundUnits} : {fail: 'units not found'}
    }else if(find === "parents"){
        const foundUnits = await findEligibleUnitParents()
        response.status = 200
        response.message = foundUnits ? {success: foundUnits} : {fail: 'units not found'}
    }else if(find === "one"){
        const foundUnit = await findOneUnitByName(unitName)
        response.status = 200
        response.message = foundUnit ? { success: foundUnit }: { fail :'unit not found' }
    }else{
        response.status = 403
        response.message = {error: ["find parameter not defined"]}
    }
    return new Response(JSON.stringify(response.message),{status: response.status})
}
export async function POST({ url }) {
    let newUnitAlias = url.searchParams.get('unit') ?? ''
    newUnitAlias = newUnitAlias.trim().toLowerCase()
    let newUnitConversion = url.searchParams.get('conversion') ?? '0'
    newUnitConversion = parseFloat(newUnitConversion.trim())
    let newUnitParent = url.searchParams.get('parent') ?? ''
    newUnitParent = newUnitParent.trim().toLowerCase()

    let newUnit = new UnitOfMeasure(newUnitAlias, `${newUnitAlias}*${newUnitConversion}_${newUnitParent}` , 0 , newUnitConversion)
    let errors = verifyUnit(newUnit)
    if(newUnitParent.split('*').length > subUnitLimit + 1){
        errors.push('sub-unit limit cannot be exceeded')
    }
    if(errors.length !== 0){
        return new Response(JSON.stringify({error: errors}),{status: 403})
    }
    if(!await findOneUnitByName(newUnit.name)){
        const parent = await findOneUnitByName(newUnitParent)
        if(parent && parent.isActive){
            newUnit.type = parent.type
            newUnit.conversion = newUnitConversion * parent.conversion
            await units.insertOne(newUnit)
            response.status = 200
            response.message = { success: newUnit }
        }else{
            response.status = 403
            response.message = {error: [`The unit's parent does not exist or is no longer selectable`]}
        } 
    }else{
        response.status = 403
        response.message = {error: [`The unit (${newUnit.name.replaceAll('*', ' X ').replaceAll('_','')}) already exists`]}
    }
    return new Response(JSON.stringify(response.message),{status: response.status})
}
export async function PATCH({ url }) {
    let unitName = url.searchParams.get('name') ?? ''
    unitName = unitName.trim().toLowerCase()
    let isActive = url.searchParams.get('active') ?? ''
    if(isActive !== "true" && isActive !== "false"){
        response.status = 403
        response.message = {error:['active parameter not defined']}
        return new Response(JSON.stringify(response.message),{status: response.status})
    }
    isActive = isActive === "false" ? false : true
    if(await findOneCustomUnitByName(unitName)){
        await units.updateOne({name: unitName, author: companyName },{$set: {isActive: isActive} })
        response.status = 200
        response.message = {success: `the unit (${unitName.replaceAll('*', ' X ').replaceAll('_','')}) is ${isActive ? 'now' : 'no longer'} selectable`}
    }else{
        response.status = 403
        response.message = {error: [`the unit (${unitName.replaceAll('*', ' X ').replaceAll('_','')}) does not exist`]}
    }

    return new Response(JSON.stringify(response.message),{status: response.status})
}