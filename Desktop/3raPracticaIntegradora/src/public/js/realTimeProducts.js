const socket = io()

const newProduct = document.getElementById('newProduct')

newProduct.addEventListener('submit', (event) => {
    event.preventDefault()

    const title = document.getElementById('title').value
    const description = document.getElementById('description').value
    const price = document.getElementById('price').value
    const thumbnails = document.getElementById('thumbnails').value
    const code = document.getElementById('code').value
    const stock = document.getElementById('stock').value
    const category = document.getElementById('category').value

    const newProductData = {
        title,
        description,
        price: parseInt(price),
        thumbnails,
        code,
        stock: parseInt(stock),
        status: true,
        category
    }
    socket.emit('addProduct', newProductData)

})

//State Result Message
socket.on('productAddedState', (result) => {
    const resultElement = document.getElementById('resultAdd')
    if (resultElement) {
        resultElement.innerHTML = result
    }
})

//delete product
const deleteProduct = document.getElementById('deleteProduct')

deleteProduct.addEventListener('submit', (event) => {
    event.preventDefault()
    const inputNum = document.getElementById('inputNum').value
    socket.emit('deleteProduct', inputNum)
})

//State result message
socket.on('deleteProduct', (productState) => {
    const resultDelete = document.getElementById('resultDelete')
    if (resultDelete) {
        resultDelete.innerHTML = productState
    }
})

// Listen to the 'updateProducts' event sent from the server
socket.on('updateProducts', (newProducts) => {
    // Update the list of products in the view
    const productList = document.getElementById('realTimeProductList')
    productList.innerHTML = ''
    newProducts.forEach((product) => {
        const listItem = document.createElement('li')
        listItem.className = 'box_container'
        listItem.innerHTML = `
            <h2>${product.title}</h2>
            <p>Description: ${product.description}</p>
            <p>Price: $${product.price}</p>
            <p>Code Prod.: ${product.code}</p>
            <p>Stock: ${product.stock}</p>
            <p>ID: ${product._id}</p>
        `
        productList.appendChild(listItem)
    })
})