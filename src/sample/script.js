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
class Article{
    constructor(articleName, articleGroup, unitOfMeasure, defaultEdiblePortion, suppliers = [], pictures = []){
        articleName,
        articleGroup,
        unitOfMeasure,
        defaultEdiblePortion,
        suppliers,
        pictures,
        allergens,
        labels
    }
}
class Supplier{
    constructor(supplierName, phoneNumber, email){
        supplierName,
        phoneNumber,
        email
    }
}
class ArticleGroup{
    constructor(groupName, description){
        groupName,
        description,
        allergens,
        labels
    }
}

