import { user } from "$db/company"

const transactionTypes = ["purchase", "transfer", "wastage", "consumption", "productionin", "productionout", "adjustment"]

class InventoryTransaction{
    constructor(date, reference, source, destination, type, quantity, unit, rate, discounts, tax, brand, description, user){
        this.date = date,
        this.reference =reference,
        this.source = source,
        this.destination = destination,
        this.type = type,
        this.quantity = quantity,
        this.unit = unit
        this.rate = rate,
        this.discounts = discounts,
        this.tax = tax,
        this.brand = brand,
        this.description = description,
        this.user = user
    }

}

function inventoryMovementTransaction(type, documentNumber, sourceCenter, destinationCenter, qty, uom, rate, discount, tax, brand, description){
    return new InventoryTransaction( (new Date()).toISOString() , documentNumber, sourceCenter, destinationCenter, type, qty, uom, rate, discount, tax, brand, description, user)
}

export{ inventoryMovementTransaction }