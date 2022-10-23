const taxNameRegex = /(^[a-zA-Z\d][a-zA-Z\d\s]{0,14}[a-zA-Z\d]$)/
const unitRegex = /(^[a-zA-Z\d]{1,12}$)/
const groupNameRegex = /^[ A-Za-z\d\s~!_@$%^()=\[\]{}|'";:\\?<>.,\/#&+-]{2,32}$/
const materialNameRegex = /^[ A-Za-z\d\s~!_@$%^*()=\[\]{}|'";:\\?<>.,\/#&+-]{2,64}$/
const descriptionRegex = /^[ A-Za-z\d\s~!_@$%^*()=\[\]{}|'";:\\?<>.,\/#&+-]{3,144}$/

function verifyTax(tax){
    let errors = []
    if(!taxNameRegex.test(tax.name)) errors.push('tax name must have more than 1 and not more than 16 characters of alphabets and numbers only')
    if(tax.rate <= 0 || isNaN(tax.rate)) errors.push('tax must be greater than 0')
    return errors
}

function verifyUnit(unit){
    let errors = []
    if(!unitRegex.test(unit.unit)) errors.push('unit must have atleast 1 and not more than 12 characters of alphabets and numbers only and must not contain spaces')
    if(unit.conversion <= 0 || isNaN(unit.conversion)) errors.push('conversion must be greater than 0')
    return errors
}
function verifyGroup(group){
    let errors = []
    if(!groupNameRegex.test(group.name)) errors.push('group name must have more than 1 and not more than 20 characters and must not contain a *')
    if(!descriptionRegex.test(group.description)) errors.push('description must contain more than 2 and not more than 144 characters')
    return errors
}
function verifyInputMaterial(material){
    let errors = []
    if(!materialNameRegex.test(material.name))errors.push('material name must contain more than 1 and not more than 64 characters')
    return errors
}

export { verifyTax, verifyUnit, verifyGroup, verifyInputMaterial }