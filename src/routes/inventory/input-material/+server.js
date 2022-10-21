class Material{
    constructor(materialName, materialGroup, baseUnitType, materialDescription, units=[], inventoryTransactions = [], suppliers = [], pictures = [], labels = [], activeCentres=[]){
        this.materialName = materialName,
        this.materialGroup = materialGroup,
        this.baseUnitType = baseUnitType,
        this.units = units,
        this.inventoryTransactions = inventoryTransactions,
        this.materialDescription = materialDescription,
        this.inputs = suppliers,
        this.pictures = pictures,
        this.labels = labels,
        this.activeCentres = activeCentres
    }
}

class InventoryTransaction{
    constructor(date, from, to, type, qty, unit, ref, trackingdetails)
}
class SupplierTransactions{
    constructor(source, rate, tax, discounts, productName, brand, labels, conversion)
}
//intermediate(supplier is internal)
//transactions (purchases, returns, transfers, production-, **sales**, wastage, adjustment+-)
//tracking details = expiry, unit, cost, requestedby.date, issuedby.date, receivedby.date, label, authorizedby, supplier
//costcentre name closing stock
//labels precaution info
export async function GET(){
    if(2>1) return new Response("yoooo")
    return new Response("YooIIIIIIo")
}