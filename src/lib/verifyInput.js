const taxTypeRegex = /(^[a-zA-Z\d][a-zA-Z\d\s]{0,20}[a-zA-Z\d]$)/
const unitRegex = /(^[a-zA-Z\d\s]{1,12}$)/
const unitTypes = ["weight", "volume", "number"]

function verifyTax(tax){
    let errors = []
    if(!taxTypeRegex.test(tax.type)) errors.push('tax name must have more than one and not more than 20 characters of alphabets and numbers only')
    if(tax.rate <= 0 || isNaN(tax.rate)) errors.push('tax must be greater than zero')
    return errors
}

function verifyUnit(unit){
    let errors = []
    if(!unitRegex.test(unit.unit)) errors.push('unit must have more than one and not more than 12 characters of alphabets and numbers only and must not contain spaces')
    if(unit.conversion <= 0 || isNaN(unit.conversion)) errors.push('conversion must be greater than zero')
    if(!unitTypes.includes(unit.type)) errors.push('unit type does not exist')
    return errors
}

export { verifyTax, verifyUnit }