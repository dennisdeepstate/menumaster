class User{
    constructor(firstName, lastName, phoneNumber, accessKey, menus = [], isAdmin){
        firstName,
        lastName,
        email,
        phoneNumber,
        accessKey,
        menus,
        isAdmin
    }
}
class Menu{
    constructor(menuTitle, menuItems= [], authors = []){
        menuTitle,
        menuItems,
        authors
    }
}
class MenuItem{
    constructor(menuItemName, author, description, readyToServePackagings = [], recipe, pictures = []){
        menuItemName,
        author,
        description,
        readyToServePackagings,
        recipe,
        pictures
    }
}
class ReadyToServePackaging{
    constructor(readyToServeSize, unitOfMeasure, idealSellingPricePerPortion, taxes = [], isInterMediate){
        readyToServeSize,
        unitOfMeasure,
        idealSellingPricePerPortion,
        taxes,
        isInterMediate
    }
}
class Recipe{
    constructor(numberOfServings, ingredients = [], procedures = []){
        numberOfServings,
        ingredients,
        procedures
    }
}
class Ingredient{
    constructor(article, quantity, baseUnitOfMeasure, ediblePortion, leastPrice, maxPrice, averagePrice){
        article,
        quantity,
        baseUnitOfMeasure,
        ediblePortion,
        leastPrice,
        maxPrice,
        averagePrice
    }
}
class Supplier{
    constructor(supplierName, phoneNumber, email){
        supplierName,
        phoneNumber,
        email
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
