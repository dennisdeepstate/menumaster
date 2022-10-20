import { companies, companyName } from "$db/company"
import { verifyGroup } from "$lib/verifyInput"

class InputMaterialGroup{
    constructor(name, ancestry, description, isActive = true){
        this.name = name,
        this.ancestry = ancestry,
        this.description = description,
        this.isActive = isActive
    }
}

let response = {
    status: 500,
    message: {error: ["an error occured on the server"]}
}

async function findAllInputMaterialGroups(){
    const data = await companies.findOne({name: companyName}, { projection: { _id: false, inputMaterialGroups: true} })
    return data.inputMaterialGroups
}
async function findAllActiveInputMaterialGroups(){
    const data = await findAllInputMaterialGroups()
    return data.filter(inputMaterialGroup => inputMaterialGroup.isActive === true)
}
async function findOneInputMaterialGroup(groupName){
    const data = await findAllInputMaterialGroups()
    return data.find(inputMaterialGroup => inputMaterialGroup.name === groupName)
}

export async function GET({ url }) {
    response.status = 200
    let groupName = url.searchParams.get('name') ?? ''
    groupName = groupName.trim().toLowerCase()
    const find = url.searchParams.get('find') ?? ''
    if(find === "all"){
        response.message = {success: await findAllInputMaterialGroups()}
    }else if(find === "active"){
        response.message = {success: await findAllActiveInputMaterialGroups()}
    }else if(find === "one"){
        const foundGroup = await findOneInputMaterialGroup(groupName)
        response.message = foundGroup ? { success: foundGroup }: { fail :'group not found' }
    }else{
        response.status = 403
        response.message = {error: ["find parameter is not defined"]}
    }
    return new Response(JSON.stringify(response.message),{status: response.status})
}

export async function POST({ url }) {
    let newGroupName = url.searchParams.get('name') ?? ''
    newGroupName = newGroupName.trim().toLowerCase()
    let newGroupDescription = url.searchParams.get('description') ?? ''
    newGroupDescription = newGroupDescription.trim().toLowerCase()
    let newGroupParent = url.searchParams.get('parent') ?? ''
    newGroupParent = newGroupParent.trim().toLowerCase()

    let newGroup = new InputMaterialGroup(newGroupName, `${newGroupName}${newGroupParent === '' ? '' : '*' + newGroupParent}` , newGroupDescription)
    const errors = verifyGroup(newGroup)
    if(errors.length === 0){
        if(!await findOneInputMaterialGroup(newGroup.name)){
            const parent = await findOneInputMaterialGroup(newGroupParent)
            if((parent && parent.isActive) || newGroup.name === newGroup.ancestry){
                await companies.updateOne({name: companyName},{$push : {inputMaterialGroups: newGroup }})
                response.status = 200
                response.message = { success: newGroup }
            }else{
                response.status = 403
                response.message = {error: [`The group's parent does not exist or is not longer active`]}
            } 
        }else{
            response.status = 403
            response.message = {error: [`The group (${newGroup.name}) already exists`]}
        }
    }else{
        response.status = 403
        response.message = {error: errors} 
    }

    return new Response(JSON.stringify(response.message),{status: response.status})
}

export async function PUT({ url }) {
    let group = {}
    let groupName = url.searchParams.get('name') ?? ''
    groupName = groupName.trim().toLowerCase()
    let groupDescription = url.searchParams.get('description') ?? ''
    groupDescription = groupDescription.trim().toLowerCase()
    group.name = groupName
    group.description = groupDescription
    const errors = verifyGroup(group)
    let isActive = url.searchParams.get('active') ?? ''
    if(isActive !== "true" && isActive !== "false"){
        response.status = 403
        response.message = {error:['active parameter not defined']}
        return new Response(JSON.stringify(response.message),{status: response.status})
    }
    isActive = isActive === "true" ? true : false
    if(errors.length === 0){
        if(await findOneInputMaterialGroup(groupName)){
            await companies.updateOne({name: companyName, "inputMaterialGroups.name" : groupName },{$set: {"inputMaterialGroups.$.description": groupDescription, "inputMaterialGroups.$.isActive": isActive} })
            response.status = 200
            response.message = {success: `changes updated`}   
        }else{
            response.status = 403
            response.message = {error: [`the group (${groupName}) does not exist`]}
        }
    }else{
        response.status = 403
        response.message = errors
    }
    return new Response(JSON.stringify(response.message),{status: response.status})
}