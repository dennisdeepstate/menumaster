import { companyName, inputMaterials, findAllInputMaterials, findAllActiveInputMaterials, findOneInputMaterial, findOneInputMaterialByName, findPrecedingMaterial } from "$db/find"
import { ObjectId } from "mongodb"
import { verifyInputMaterial } from "$lib/verifyInput"
import { findOneUnitByName } from "$db/find"
import { findOneGroup } from "$db/find"
import { unitTransaction, nameTransaction } from "./inventory-transactions/+server"

class InputMaterial{
    constructor(name, code, group, baseUnit, inventoryTransactions = [], precautions = [], author=companyName, isActive=true){
        this.name = name,
        this.code = code,
        this.group = group,
        this.baseUnit = baseUnit,
        this.inventoryTransactions = inventoryTransactions,
        this.precautions = precautions,
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
    let newMaterialDefaultUnit = url.searchParams.get('unit') ?? ''
    newMaterialDefaultUnit = newMaterialDefaultUnit.trim().toLowerCase()
    let newMaterialGroup = url.searchParams.get('group') ?? ''
    newMaterialGroup = newMaterialGroup.trim().toLowerCase()
    let newMaterial = new InputMaterial(newMaterialName, 1, newMaterialGroup , newMaterialDefaultUnit)
    let errors = verifyInputMaterial(newMaterial)
    newMaterial.inventoryTransactions.push( nameTransaction(newMaterial.name) )
    const baseUnit = await findOneUnitByName(newMaterial.baseUnit)
    const group = await findOneGroup(newMaterial.group)
    if(!baseUnit || !baseUnit.isActive){
        errors.push('the unit selected does not exist or is no longer selectable')
    }else{
        const findBaseUnit = baseUnit.name.split('_')
        newMaterial.baseUnit = findBaseUnit[findBaseUnit.length - 1]
        newMaterial.inventoryTransactions.push( unitTransaction(newMaterialDefaultUnit, 1) )
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

export async function PATCH({ url }) {

    let changes = url.searchParams.get('changes') ?? ''
    changes = changes.trim()
    let changesArray = changes.split(',')
    let materialId = url.searchParams.get('id') ?? ''
    materialId = materialId.trim()
    let newMaterialName = url.searchParams.get('name') ?? ''
    newMaterialName = newMaterialName.trim()
    let newMaterialGroup = url.searchParams.get('group') ?? ''
    newMaterialGroup = newMaterialGroup.trim().toLowerCase()
    let isActive = url.searchParams.get('active') ?? ''
    let i = 0
    let material = new InputMaterial(newMaterialName, 1, newMaterialGroup)
    let errors = verifyInputMaterial(material)

    const listOfChanges = ['name', 'group', 'isactive']
    const group = await findOneGroup(material.group)
    const currentMaterial = await findOneInputMaterial(materialId)
    const materialWithName = await findOneInputMaterialByName(material.name)

    if(changesArray.length > listOfChanges.length){
        return new Response(JSON.stringify({error:['list of changes is too long']}),{status: 403})
    }
    while(changesArray.length > 0 && !listOfChanges.includes(changesArray[i]) && i < changesArray.length){
        errors.push(`${changesArray[i]} is not valid`)
        i++
    }
    
    if(!ObjectId.isValid(materialId) || !currentMaterial){
        errors.push('material id is not valid')
    }
    if((isActive !== "true" && isActive !== "false") && changes.includes('isactive')){
        errors.push('active parameter not defined')
    }
    if((!group || !group.isActive) && changes.includes('group')){
        errors.push('the group selected does not exist or is no longer selectable')
    }
    if(materialWithName && materialWithName !== currentMaterial && changes.includes('name')){
        errors.push(`The item (${material.name}) already exists`)
    }
    if(errors.length !== 0){
        return new Response(JSON.stringify({error: errors}),{status: 403})
    }
    if(changesArray.includes('isactive')){
        material.isActive = isActive === "true" ? true : false
        await inputMaterials.updateOne({_id: ObjectId( materialId ) },{$set: {isActive: material.isActive} })    
    }
    if(changesArray.includes('group')){
        let precedingMaterialCode
        const precedingMaterial = (await findPrecedingMaterial(group.name))
        precedingMaterialCode = precedingMaterial ? precedingMaterial.code : (group.code * 1000)
        if(precedingMaterialCode >= ((group.code * 1000) + 999)){
            errors.push(`material codes in the (${group.name}) group have reached the limit of ${((group.code * 1000) + 999)}`)     
        }
        material.code = currentMaterial.group === material.group ? currentMaterial.code : (precedingMaterialCode + 1)
        await inputMaterials.updateOne({_id: ObjectId( materialId ) },{$set: {code: material.code, group: material.group} })
    }
    if(changesArray.includes('name')){
        await inputMaterials.updateOne({_id: ObjectId( materialId ) },{$set: {name: material.name} })
    }

    return new Response(JSON.stringify({ success: 'changes updated' }),{status: 200})
}