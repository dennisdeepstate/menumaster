import { companyName, taxes, findAllTaxes, findOneTax} from "$db/find"
import { verifyTax } from "$lib/verifyInput"

class Tax{
    constructor(name, rate, author=companyName){
        this.name = name,
        this.rate = rate,
        this.author = author
    }
}
let response = {
    status: 500,
    message: {error:["an error occured on the server"]}
}
export async function GET({ url }) {
    let taxName = url.searchParams.get('name') ?? ''
    taxName = taxName.trim().toUpperCase()
    const find = url.searchParams.get('find') ?? ''
    if(find === "all"){
        const foundTaxes = await findAllTaxes()
        response.status = 200
        response.message = foundTaxes.length > 0 ? {success: foundTaxes} : {fail: 'taxes not found'}
    }else if(find === "one"){
        const foundTax = await findOneTax(taxName)
        response.status = 200
        response.message = foundTax ? { success: foundTax }: { fail :"tax not found" }
    }else{
        response.status = 403
        response.message = {error: ["find parameter not defined"]}
    }
    return new Response(JSON.stringify(response.message),{status: response.status})
}
export async function POST({ url }) {
    let newTaxName = url.searchParams.get('name') ?? ''
    newTaxName = newTaxName.trim().toUpperCase()
    let newTaxRate = url.searchParams.get('rate') ?? '0'
    newTaxRate = parseFloat(newTaxRate.trim())
    const newTax = new Tax(newTaxName, newTaxRate)
    const errors = verifyTax(newTax)
    if(errors.length > 0){
        return new Response(JSON.stringify({error: errors}),{status: 403})
    }
    if(!await findOneTax(newTax.name)){
        await taxes.insertOne(newTax)
        response.status = 200
        response.message = { success: newTax }
    }else{
        response.status = 403
        response.message = {error: [`${newTax.name} tax already exists`]} 
    }

    return new Response(JSON.stringify(response.message),{status: response.status})
}
export async function PATCH({ url }) {
    let taxName = url.searchParams.get('name') ?? ''
    taxName = taxName.trim().toUpperCase()
    let newTaxRate = url.searchParams.get('rate') ?? ''
    newTaxRate = parseFloat(newTaxRate.trim())
    const updateTax = new Tax(taxName, newTaxRate)
    const errors = verifyTax(updateTax)
    if(errors.length > 0){
        return new Response(JSON.stringify({error: errors}),{status: 403})
    }
    if(await findOneTax(updateTax.name)){
        await taxes.updateOne({name: updateTax.name, author : companyName },{$set: {rate: updateTax.rate} })
        response.status = 200
        response.message = {success: updateTax}
    }else{
        response.status = 403
        response.message = {error: [`${updateTax.name} tax does not exist`]}
    }
   
    return new Response(JSON.stringify(response.message),{status: response.status})
}
export async function DELETE({ url }) {
    response.status = 200
    let taxName = url.searchParams.get('name') ?? ''
    taxName = taxName.trim().toUpperCase()
    if(await findOneTax(taxName)){
        await taxes.deleteOne({name: taxName, author: companyName})
        response.status = 200
        response.message = {success: `${taxName} deleted`} 
    }else{
       response.status = 403
       response.message = {error: [`${taxName} tax does not exist`]}
    }
    
    return new Response(JSON.stringify(response.message),{status: response.status})
}