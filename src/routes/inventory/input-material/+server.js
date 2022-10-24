import { companyName, inputMaterials, findAllInputMaterials, findAllActiveInputMaterials, findOneInputMaterial, findOneInputMaterialByName, findPrecedingMaterial } from "$db/find"
import { ObjectId } from "mongodb"
import { verifyInputMaterial } from "$lib/verifyInput"
import { findOneUnitByName } from "$db/find"
import { findOneGroup } from "$db/find"

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

const finds = ["all", "active", "one"]
let response = {
    status: 500,
    message: {error:["an error occured on the server"]}
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
    const baseUnit = await findOneUnitByName(newMaterial.baseUnit)
    const group = await findOneGroup(newMaterial.group, "inputmaterial")
    if(!baseUnit || !baseUnit.isActive){
        errors.push('the unit selected does not exist or is no longer selectable')
    }else{
        const findBaseUnit = baseUnit.name.split('_')
        newMaterial.baseUnit = findBaseUnit[findBaseUnit.length - 1]
        newMaterial.units.push({unit: newMaterialBaseUnit, owner: 1})
    }
    if(!group || !group.isActive){
        errors.push('the group selected does not exist or is no longer selectable')
    }else{
        const precedingMaterial = (await findPrecedingMaterial(group.name))
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