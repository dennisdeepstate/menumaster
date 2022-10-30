import {
    companyName,
    findOneUnitByName,
    groupTypes,
    findOneGroup,
    findOneGroupByType,
    materials,
    findAllMaterials,
    findAllActiveMaterials,
    findOneMaterial,
    findOneMaterialByName,
    findPrecedingMaterial
} from "$db/find"

import { ObjectId } from "mongodb"
import { verifyMaterial } from "$lib/verifyInput"

class Material{
    constructor(name, code, type, group, baseUnit, inventoryTransactions = [], centers = [], precautions = [], author=companyName, isActive=true){
        this.name = name,
        this.code = code,
        this.type = type,
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
    const type = url.searchParams.get('type') ?? ''
    if(!finds.includes(find)){
        return new Response(JSON.stringify({error: ["'find' parameter is required"]}),{status: 403})
    }
    if(!groupTypes.includes(type) && find !== "one"){
        return new Response(JSON.stringify({error: ["'type' parameter is required"]}),{status: 403})
    }
    if(find === "all"){
        const foundMaterials = await findAllMaterials(type)
        response.status = 200
        response.message = foundMaterials.length > 0 ? {success: foundMaterials} : {fail: 'items not found'}
    }
    if(find === "active"){
        const foundMaterials = await findAllActiveMaterials(type)
        response.status = 200
        response.message = foundMaterials.length > 0 ? {success: foundMaterials} : {fail: 'items not found'}
    }
    if(find === "one"){
        const foundMaterial = ObjectId.isValid(materialId) ? await findOneMaterial(materialId) : false
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
    let newMaterial = new Material(newMaterialName, 1, '', newMaterialGroup , newMaterialDefaultUnit)
    let errors = verifyMaterial(newMaterial)
    const baseUnit = await findOneUnitByName(newMaterial.baseUnit)
    const group = await findOneGroup(newMaterial.group)
    if(!baseUnit || !baseUnit.isActive){
        errors.push('the unit selected does not exist or is no longer selectable')
    }else{
        const findBaseUnit = baseUnit.name.split('_')
        newMaterial.baseUnit = findBaseUnit[findBaseUnit.length - 1]
    }
    if(!group || !group.isActive){
        errors.push('the group selected does not exist or is no longer selectable')
    }else{
        const precedingMaterial = (await findPrecedingMaterial(group.name))
        newMaterial.type = group.type
        precedingMaterialCode = precedingMaterial ? precedingMaterial.code : (group.code * 1000)
        if(precedingMaterialCode >= ((group.code * 1000) + 999)){
            errors.push(`material codes in the (${group.name}) group have reached the limit of ${((group.code * 1000) + 999)}`)     
        }
    }
    if(errors.length !== 0){
        return new Response(JSON.stringify({error: errors}),{status: 403})
    }
    if(!await findOneMaterialByName(newMaterial.name, group.type)){
        newMaterial.code = (precedingMaterialCode + 1)
        await materials.insertOne(newMaterial)
        response.status = 200
        response.message = { success: newMaterial }
    }else{
        response.status = 403
        response.message = {error: [`The item (${newMaterial.name}) already exists`]}
    }

    return new Response(JSON.stringify(response.message),{status: response.status})
}

export async function PATCH({ url }) {

    let changesArray = url.searchParams.get('changes') ?? ''
    changesArray = changesArray.trim().split(',')
    let materialId = url.searchParams.get('id') ?? ''
    materialId = materialId.trim()
    let newMaterialName = url.searchParams.get('name') ?? ''
    newMaterialName = newMaterialName.trim()
    let newMaterialGroup = url.searchParams.get('group') ?? ''
    newMaterialGroup = newMaterialGroup.trim().toLowerCase()
    let isActive = url.searchParams.get('active') ?? ''
    let i = 0
    let material = new Material(newMaterialName, 1, '', newMaterialGroup)
    let errors = verifyMaterial(material)
    let precedingMaterialCode

    const listOfChanges = ['name', 'group', 'isactive']
    const currentMaterial = ObjectId.isValid(materialId) ? await findOneMaterial(materialId) : undefined
    const group = await findOneGroupByType(material.group, currentMaterial ? currentMaterial.type : 0)
    const materialWithName = await findOneMaterialByName(newMaterialName, group ? group.type : 0)

    if(changesArray.length > listOfChanges.length){
        return new Response(JSON.stringify({error:['list of changes is too long']}),{status: 403})
    }
    while(changesArray.length > 0 && !listOfChanges.includes(changesArray[i]) && i < changesArray.length){
        errors.push(`${changesArray[i]} is not a valid change parameter`)
        i++
    }
    
    if(!currentMaterial){
        errors.push('material id is not valid')
    }
    if((isActive !== "true" && isActive !== "false") && changesArray.includes('isactive')){
        errors.push('active parameter not defined')
    }
    if((!group || !group.isActive) && changesArray.includes('group')){
        errors.push('the group selected does not exist or is no longer selectable')
    }
    if(group && group.isActive && changesArray.includes('group')){
        const precedingMaterial = await findPrecedingMaterial(group.name)
        precedingMaterialCode = precedingMaterial ? precedingMaterial.code : (group.code * 1000)
        if(precedingMaterialCode >= ((group.code * 1000) + 999)){
            errors.push(`material codes in the (${group.name}) group have reached the limit of ${((group.code * 1000) + 999)}`)     
        }
    }
    if(materialWithName && materialWithName !== currentMaterial && changesArray.includes('name')){
        errors.push(`The item (${material.name}) already exists`)
    }
    if(errors.length !== 0){
        return new Response(JSON.stringify({error: errors}),{status: 403})
    }
    if(changesArray.includes('isactive')){
        material.isActive = isActive === "true" ? true : false
        await materials.updateOne({_id: ObjectId( materialId ) },{$set: {isActive: material.isActive} }) 
    }
    if(changesArray.includes('group')){
        material.code = currentMaterial.group === material.group ? currentMaterial.code : (precedingMaterialCode + 1)
        await materials.updateOne({_id: ObjectId( materialId ) },{$set: {code: material.code, group: material.group}})
    }
    if(changesArray.includes('name')){
        await materials.updateOne({_id: ObjectId( materialId ) },{$set: {name: material.name}})
    }

    return new Response(JSON.stringify({ success: 'changes updated' }),{status: 200})
}