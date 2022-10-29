import { user } from "$db/company"

const transactionTypes = ["unit", "name", "center", "purchase", "transfer", "wastage", "consumption", "production"]

class InventoryTransaction{
    constructor(date, source, destination, type, quantity, unit, rate, discounts, tax, brand, trackingDetails){
        this.date = date,
        this.source = source,
        this.destination = destination,
        this.type = type,
        this.quantity = quantity,
        this.unit = unit
        this.rate = rate,
        this.discounts = discounts,
        this.tax = tax,
        this.brand = brand,
        this.trackingDetails = trackingDetails
    }

}

function unitTransaction(unitName, center, isActive=true){
    return new InventoryTransaction( (new Date()).toISOString(), center, '', 'unit', 0, unitName, 0, 0, 0, '',{isActive: isActive, user: user} )
}
function nameTransaction(name){
    return new InventoryTransaction( (new Date()).toISOString() , name, '', 'name', 0, '', 0, 0, 0, '',{user: user} )
}
//unit
//21-08-2022 source: center unit {isActive: true, user: james}
//21-08-2022 source: newname name
//date source: center center
//
export { unitTransaction, nameTransaction }