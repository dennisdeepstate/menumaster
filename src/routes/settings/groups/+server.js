import { companyName, groups, findAllGroups, findAllActiveGroups, findAllEligibleGroupParents, findOneGroup, findOneGroupByAncestry, findPrecedingGroup } from "$db/find"
import { verifyGroup } from "$lib/verifyInput"
import { subGroupLimit } from "$db/company"

class Group{
    constructor(name, code, ancestry, description, type, author=companyName, isActive = true){
        this.name = name,
        this.code = code,
        this.ancestry = ancestry,
        this.description = description,
        this.type = type,
        this.author = author,
        this.isActive = isActive
    }
}

let response = {
    status: 500,
    message: {error: ["an error occured on the server"]}
}

const groupTypes = ["inputmaterial", "salesmaterial"]
const finds = ["all", "parents", "active", "one"]

export async function GET({ url }) {
    let groupName = url.searchParams.get('name') ?? ''
    groupName = groupName.trim().toLowerCase()
    const find = url.searchParams.get('find') ?? ''
    const type = url.searchParams.get('type') ?? ''
    if(!finds.includes(find) || !groupTypes.includes(type)){
        return new Response(JSON.stringify({error: ["'find' and 'type' parameters are required"]}),{status: 403})
    }
    if(find === "all"){
        const foundGroups = await findAllGroups(type)
        response.status = 200
        response.message = foundGroups.length > 0 ? {success: foundGroups} : {fail: 'groups not found'}
    }
    if(find === "active"){
        const foundGroups = await findAllActiveGroups(type)
        response.status = 200
        response.message = foundGroups.length > 0 ? {success: foundGroups} : {fail: 'groups not found'}
    }
    if(find === "parents"){
        const foundGroups = await findAllEligibleGroupParents(type)
        response.status = 200
        response.message = foundGroups.length > 0 ? {success: foundGroups} : {fail: 'groups not found'}
    }
    if(find === "one"){
        const foundGroup = await findOneGroup(groupName, type)
        response.status = 200
        response.message = foundGroup ? { success: foundGroup }: { fail: 'group not found' }
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
    let newGroupType = url.searchParams.get('type') ?? ''
    newGroupType = newGroupType.trim().toLowerCase()

    let newGroup = new Group(newGroupName, 1,`${newGroupParent === '' ? '' : newGroupParent + '*'}${newGroupName}` , newGroupDescription, newGroupType)
    let errors = verifyGroup(newGroup)
    if(!groupTypes.includes(newGroup.type)){
        errors.push(`group type must be one of (${groupTypes})`)
    }
    if(newGroupParent.split('*').length > subGroupLimit + 1){
        errors.push(`subgroup limit cannot be exceeded`)
    }
    const precedingGroup = await findPrecedingGroup()
    let precedingGroupCode = precedingGroup ? precedingGroup.code : 0
    if(precedingGroupCode >= 999){
        errors.push(`group codes have reached the limit of 999`)        
    }
    if(errors.length !== 0){
        return new Response(JSON.stringify({error: errors}),{status: 403})
    }
    if(!await findOneGroup(newGroup.name, newGroup.type)){
        const parent = await findOneGroupByAncestry(newGroupParent, newGroup.type)
        if((parent && parent.isActive) || newGroup.name === newGroup.ancestry){
            newGroup.code = precedingGroupCode + 1
            await groups.insertOne(newGroup)
            response.status = 200
            response.message = { success: newGroup }
        }else{
            response.status = 403
            response.message = {error: [`The group's parent does not exist or is no longer selectable`]}
        } 
    }else{
        response.status = 403
        response.message = {error: [`The group (${newGroup.name}) already exists`]}
    }

    return new Response(JSON.stringify(response.message),{status: response.status})
}

export async function PUT({ url }) {
    let groupName = url.searchParams.get('name') ?? ''
    groupName = groupName.trim().toLowerCase()
    let groupDescription = url.searchParams.get('description') ?? ''
    let isActive = url.searchParams.get('active') ?? ''
    groupDescription = groupDescription.trim().toLowerCase()
    let groupType = url.searchParams.get('type') ?? ''
    groupType = groupType.trim().toLowerCase()
    let group = new Group(groupName, '', groupDescription, groupType)
    let errors = verifyGroup(group)
    if(isActive !== "true" && isActive !== "false"){
        errors.push('active parameter not defined')
    }
    if(!groupTypes.includes(group.type)){
        errors.push(`group type must be one of (${groupTypes})`)
    }
    if(errors.length !== 0){
        response.status = 403
        response.message = errors
        return new Response(JSON.stringify(response.message),{status: response.status})
    }
    isActive = isActive === "true" ? true : false
    if(await findOneGroup(groupName, group.type)){
        await groups.updateOne({name: groupName, type: groupType },{$set: {description: groupDescription, isActive: isActive} })
        response.status = 200
        response.message = {success: `changes updated`}   
    }else{
        response.status = 403
        response.message = {error: [`the group (${groupName}) does not exist`]}
    }
    return new Response(JSON.stringify(response.message),{status: response.status})
}