import { clientDb as db } from "$db/mongo"
import { verifyTax } from "$lib/verifyInput"

class Tax{
    constructor(type, rate){
        this.type = type,
        this.rate = rate
    }
}
const companyName = "Test Restaurant"
const companies = db.collection('Companies')
let response = {
    status: 500,
    message: {error:"an error occured on the server"}
}
async function findAllTaxTypes(){
    return await companies.findOne({name: companyName}, { projection: { _id: false, taxes: true} })
}
async function findTaxType(taxType){
    const data = (await findAllTaxTypes()).taxes
    return data.find(tax => tax.type === taxType.toUpperCase())
}
export async function GET({ url }) {
    response.status = 200
    let taxType = url.searchParams.get('type') ?? ''
    taxType.trim()
    const find = url.searchParams.get('find') ?? ''
    if(find === "all"){
        response.message = {success: (await findAllTaxTypes()).taxes}
    }else if(find === "one"){
        const tax = await findTaxType(taxType)
        const msg = tax ? { success: tax }: { fail :'tax not found' }
        response.message = msg
    }else{
        response.status = 403
        response.message = {error: "find parameter not defined"}
    }
    return new Response(JSON.stringify(response.message),{status: response.status})
}
export async function POST({ url }) {
    let newTaxType = url.searchParams.get('type') ?? ''
    newTaxType.trim()
    let newTaxRate = url.searchParams.get('rate') ?? '0'
    newTaxRate = parseFloat(newTaxRate.trim())
    const newTax = new Tax(newTaxType.toUpperCase(), newTaxRate)
    const errors = verifyTax(newTax)
    if(errors.length === 0){
        if(await findTaxType(newTax.type)){
            response.status = 403
            response.message = {error: `${newTax.type} tax type already exist`}
        }else{
           await companies.updateOne({name: companyName},{$push : {taxes: newTax }})
           response.status = 200
           response.message = { success: newTax }
        }
    }else{
        response.status = 403
        response.message = {error: errors} 
    }

    return new Response(JSON.stringify(response.message),{status: response.status})
}
export async function PUT({ url }) {
    let taxType = url.searchParams.get('type') ?? ''
    taxType.trim()
    let newTaxRate = url.searchParams.get('rate') ?? ''
    newTaxRate = parseFloat(newTaxRate.trim())
    const updateTax = {type: taxType.toUpperCase(), rate: newTaxRate}
    const errors = verifyTax(updateTax)
    if(errors.length === 0){
        if(await findTaxType(taxType)){
            await companies.updateOne({name: companyName, "taxes.type" : taxType },{$set: {"taxes.$.rate": newTaxRate} })
            response.status = 200
            response.message = {success: updateTax}
        }else{
           response.status = 403
           response.message = {error: `${updateTax.type} tax type does not exist`}
        }
    }else{
        response.status = 403
        response.message = {error: errors} 
    }

    return new Response(JSON.stringify(response.message),{status: response.status})
}
export async function DELETE({ url }) {
    response.status = 200
    const taxType = url.searchParams.get('type') ?? ''
    taxType.trim()
    if(await findTaxType(taxType)){
        await companies.updateOne({name: companyName},{$pull : {taxes: {type: taxType.toUpperCase()} }})
        response.status = 200
        response.message = {success: `${taxType} deleted`} 
    }else{
       response.status = 403
       response.message = {error: `${taxType} tax type does not exist`}
    }
    
    return new Response(JSON.stringify(response.message),{status: response.status})
}