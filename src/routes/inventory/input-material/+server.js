import { clientDb as db } from "$db/mongo"
import { companyName } from "$db/company"
import { ObjectId } from "mongodb"
import { verifyInputMaterial } from "$lib/verifyInput"
import { BASE_URL } from "$env/static/private"

class InputMaterial{
    constructor(name, code, group, baseUnit, units=[], brands = [], inventoryTransactions = [], precautions = [], activeCentres=[], author=companyName, isActive=true){
        this.name = name,
        this.code = code,
        this.group = group,
        this.baseUnit = baseUnit,
        this.units = units,
        this.brands = brands,
        this.inventoryTransactions = inventoryTransactions,
        this.precautions = precautions,
        this.activeCentres = activeCentres,
        this.author = author,
        this.isActive = isActive
    }
}

const inputMaterials = db.collection('InputMaterials')
const finds = ["all", "active", "one"]
let response = {
    status: 500,
    message: {error:["an error occured on the server"]}
}

async function findAllInputMaterials(){
    return await inputMaterials.find({author: companyName}).toArray()
}
async function findAllActiveInputMaterials(){
    return await inputMaterials.find({author: companyName, isActive: true}).toArray()
}
async function findOneInputMaterial(materialId){
    return await inputMaterials.findOne({_id: ObjectId(materialId), author: companyName})
}
async function findOneInputMaterialByName(materialName){
    return (await inputMaterials.find({name: materialName, author: companyName}).collation({ locale: 'en', strength: 2 }).toArray())[0]
}
async function getUnit(unitName){
    const response = await fetch(`${BASE_URL}/settings/units/?find=one&name=${unitName}`, {method: 'GET'})
    return await response.json()
}
async function getGroup(groupName){
    const response = await fetch(`${BASE_URL}/settings/groups/?find=one&type=inputmaterial&name=${groupName}`, {method: 'GET'})
    return await response.json()
}
async function findPrecedingMaterial(groupName){
    return await inputMaterials.find({ author:companyName, group: groupName}, { projection: { _id: false} }).sort({code: -1}).limit(1).toArray()
}
export async function GET({ url }) {
    let materialId = url.searchParams.get('id') ?? ''
    materialId = materialId.trim().toLowerCase()
    const find = url.searchParams.get('find') ?? ''
    if(!finds.includes(find)){
        return new Response(JSON.stringify({error: ["'find' parameter is required"]}),{status: 403})
    }
    if(find === "all"){
        const foundMaterials = await findAllInputMaterials()
        response.status = 200
        response.message = foundMaterials.length > 0 ? {success: foundMaterials} : {fail: 'items not found'}
    }
    if(find === "active"){
        const foundMaterials = await findAllActiveInputMaterials()
        response.status = 200
        response.message = foundMaterials.length > 0 ? {success: foundMaterials} : {fail: 'items not found'}
    }
    if(find === "one"){
        const foundMaterial = ObjectId.isValid(materialId) ? await findOneInputMaterial(materialId) : false
        response.status = 200
        response.message = foundMaterial ? { success: foundMaterial }: { fail: 'item not found' }
    }
    return new Response(JSON.stringify(response.message),{status: response.status})
}

export async function POST({ url }) {
    let precedingMaterialCode
    let newMaterialName = url.searchParams.get('name') ?? ''
    newMaterialName = newMaterialName.trim()
    let newMaterialBaseUnit = url.searchParams.get('unit') ?? ''
    newMaterialBaseUnit = newMaterialBaseUnit.trim().toLowerCase()
    let newMaterialGroup = url.searchParams.get('group') ?? ''
    newMaterialGroup = newMaterialGroup.trim().toLowerCase()
    let newMaterial = new InputMaterial(newMaterialName, 1, newMaterialGroup , newMaterialBaseUnit)
    let errors = verifyInputMaterial(newMaterial)
    const baseUnit = (await getUnit(newMaterial.baseUnit)).success
    const group = (await getGroup(newMaterial.group)).success
    if(!baseUnit || !baseUnit.isActive){
        errors.push('the unit selected does not exist or is no longer selectable')
    }
    if(!group || !group.isActive){
        errors.push('the group selected does not exist or is no longer selectable')
    }else{
        const precedingMaterial = (await findPrecedingMaterial(group.name))[0]
        precedingMaterialCode = precedingMaterial ? precedingMaterial.code : (group.code * 1000)
        if(precedingMaterialCode >= ((group.code * 1000) + 999)){
            errors.push(`material codes in the (${group.name}) group have reached the limit of ${((group.code * 1000) + 999)}`)     
        }
    }
    if(errors.length !== 0){
        return new Response(JSON.stringify({error: errors}),{status: 403})
    }
    if(!await findOneInputMaterialByName(newMaterial.name)){
        newMaterial.code = (precedingMaterialCode + 1)
        await inputMaterials.insertOne(newMaterial)
        response.status = 200
        response.message = { success: newMaterial }
    }else{
        response.status = 403
        response.message = {error: [`The item (${newMaterial.name}) already exists`]}
    }

    return new Response(JSON.stringify(response.message),{status: response.status})
}