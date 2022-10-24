import { clientDb as db } from "$db/mongo"
import { companyName } from "$db/company"

const units = db.collection('Units')
const groups = db.collection('Groups')
const inputMaterials = db.collection('InputMaterials')
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
async function findOneGroup(groupName, type){
    return await groups.findOne({ author:  companyName, type: type, name: groupName }, { projection: { _id: false} })
}
async function findOneGroupByAncestry(groupAncestry, type){
    return await groups.findOne({ author:  companyName, type: type, ancestry: groupAncestry }, { projection: { _id: false} })
}
async function findPrecedingGroup(){
    return (await groups.find({ author:  companyName}, { projection: { _id: false} }).sort({code: -1}).limit(1).toArray())[0]
}
/** inputMaterial */
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
async function findPrecedingMaterial(groupName){
    return (await inputMaterials.find({ author:companyName, group: groupName}, { projection: { _id: false} }).sort({code: -1}).limit(1).toArray())[0]
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
    groups,
    findAllGroups,
    findAllActiveGroups,
    findAllEligibleGroupParents,
    findOneGroup,
    findOneGroupByAncestry,
    findPrecedingGroup,
    inputMaterials,
    findAllInputMaterials,
    findAllActiveInputMaterials,
    findOneInputMaterial,
    findOneInputMaterialByName,
    findPrecedingMaterial,
    taxes,
    findAllTaxes,
    findOneTax
}