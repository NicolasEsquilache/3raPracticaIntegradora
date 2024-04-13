const socket = io()

let user 
let chatBox = document.getElementById('chatBox') 
Swal.fire({
    title: "Identifícate",
    input: "text",
    text: "Ingrese un correo para identificarte",
    inputValidator: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
            return 'Necesitas escribir un nombre de usuario para continuar';
        } else if (!emailRegex.test(value)) {
            return 'Ingrese un correo electrónico válido';
        }
    },
    allowOutsideClick: false
}).then(result => {
    user = result.value
    socket.emit('updateMessages')
})

// Input
chatBox.addEventListener('keyup', evt => {
    if (evt.key === "Enter") {
        if (chatBox.value.trim().length > 0) {
            socket.emit('message', { email: user, message: chatBox.value })
            chatBox.value = ''
        } else {
            console.log('El mensaje está vacío')
        }
    }
})


socket.on('messageLogs', data => {
    let log = document.getElementById('messageLogs')
    let messages = ''

    data.forEach(message => {
        messages = messages + `${message.email} dice: ${message.message} </br>`
    })

    log.innerHTML = messages
})


socket.on('newUserConnected', () => {
    Swal.fire({
        text: "Un nuevo usuario se ah conectado",
        toast: true,
        position: "top-right"
    })
})