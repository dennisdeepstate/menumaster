import { clientDb as db } from "$db/mongo"
import { companyName } from "$db/company"
import { ObjectId } from "mongodb"

const units = db.collection('Units')
const groupTypes = ["inputmaterial", "salesmaterial", "mro", "packaging"]
const groups = db.collection('Groups')
const materials = db.collection('Materials')
const taxes = db.collection('Taxes')

/** units */
async function findAllUnits(){
    return await units.find({ $or: [ { author:  companyName }, { author: 0 } ] }, { projection: { _id: false} }).toArray()
}
async function findAllActiveUnits(){
    return await units.find({ $or: [ { author:  companyName, isActive: true }, { author: 0 } ] }, { projection: { _id: false} }).toArray()
}
async function findEligibleUnitParents(){
    const data = await findAllActiveUnits()
    return data.filter(unit => unit.name.split('*').length <= subUnitLimit + 1)
}
async function findOneCustomUnitByName(unitName){
    return await units.findOne({ author:  companyName, name: unitName }, { projection: { _id: false} })
}
async function findOneUnitByName(unitName){
    return await units.findOne({ $or: [ { author:  companyName, name: unitName }, { author: 0, name: unitName} ] }, { projection: { _id: false} })
}
/** groups */
async function findAllGroups(type){
    return await groups.find({ author:  companyName, type: type }, { projection: { _id: false} }).toArray()
}
async function findAllActiveGroups(type){
    return await groups.find({ author:  companyName, type: type, isActive: true }, { projection: { _id: false} }).toArray()
}
async function findAllEligibleGroupParents(type){
    const data = await findAllActiveGroups(type)
    return data.filter(group => group.ancestry.split("*").length <= subGroupLimit + 1)
}
async function findOneGroup(groupName){
    return await groups.findOne({ author: companyName, name: groupName }, { projection: { _id: false} })
}
async function findOneGroupByType(groupName, type){
    return await groups.findOne({ author: companyName, name: groupName, type: type }, { projection: { _id: false} })
}
async function findOneGroupByAncestry(groupAncestry, type){
    return await groups.findOne({ author:  companyName, type: type, ancestry: groupAncestry }, { projection: { _id: false} })
}
async function findPrecedingGroup(){
    return (await groups.find({ author:  companyName}, { projection: { _id: false} }).sort({code: -1}).limit(1).toArray())[0]
}
/** Material */
async function findAllMaterials(type){
    return await materials.find({author: companyName, type: type}).toArray()
}
async function findAllActiveMaterials(){
    return await materials.find({author: companyName, type: type, isActive: true}).toArray()
}
async function findOneMaterial(materialId){
    return await materials.findOne({_id: ObjectId(materialId), author: companyName})
}
async function findOneMaterialByName(materialName, type){
    return (await materials.find({name: materialName, type: type, author: companyName}).collation({ locale: 'en', strength: 2 }).toArray())[0]
}
async function findPrecedingMaterial(groupName){
    return (await materials.find({ author:companyName, group: groupName}, { projection: { _id: false} }).sort({code: -1}).limit(1).toArray())[0]
}
/** taxes */
async function findAllTaxes(){
    return await taxes.find({author: companyName}, { projection: { _id: false} }).toArray()
}
async function findOneTax(taxName){
    return await taxes.findOne({name: taxName, author: companyName}, { projection: { _id: false} })
}
export{
    companyName,
    units,
    findAllUnits,
    findAllActiveUnits,
    findEligibleUnitParents,
    findOneCustomUnitByName,
    findOneUnitByName,
    groupTypes,
    groups,
    findAllGroups,
    findAllActiveGroups,
    findAllEligibleGroupParents,
    findOneGroup,
    findOneGroupByType,
    findOneGroupByAncestry,
    findPrecedingGroup,
    materials,
    findAllMaterials,
    findAllActiveMaterials,
    findOneMaterial,
    findOneMaterialByName,
    findPrecedingMaterial,
    taxes,
    findAllTaxes,
    findOneTax
}