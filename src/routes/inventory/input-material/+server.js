class InputMaterial{
    constructor(name, group, baseUnit, units=[], inventoryTransactions = [], subInputs = [], precautions = [], activeCentres=[], isActive=true){
        this.name = name,
        this.group = group,
        this.baseUnit = baseUnit,
        this.units = units,
        this.inventoryTransactions = inventoryTransactions,
        this.subInputs = subInputs,
        this.precautions = precautions,
        this.activeCentres = activeCentres,
        this.isActive = isActive
    }
}

// class InventoryTransaction{
//     constructor(date, from, to, type, qty, unit, ref, trackingdetails)
// }
// class SupplierTransactions{
//     constructor(source, rate, tax, discounts, productName, brand, labels, conversion)
// }
//intermediate(supplier is internal)
//transactions (purchases, returns, transfers, production-, **sales**, wastage, adjustment+-)
//tracking details = expiry, unit, cost, requestedby.date, issuedby.date, receivedby.date, label, authorizedby, supplier
//costcentre name closing stock
//labels precaution info
export async function GET(){
    if(2>1) return new Response("yoooo")
    return new Response("YooIIIIIIo")
}