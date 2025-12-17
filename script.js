document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('copyright-footer').textContent = `©JOMA Studios ${new Date().getFullYear()}. All rights reserved.`;
    
    const textElement = document.getElementById('home__dynamic__text');
    const cursor = document.getElementById('cursor');
    const phrases = [
        "surprise.",
        "works.",
        "solutions.",
        "results."
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 100; // ms por carácter
    const deletingSpeed = 50; // ms por carácter
    const pauseTime = 1500; // ms de pausa entre frases
    
    // Función principal de Tipeo/Borrado
    function type() {
        const currentPhrase = phrases[phraseIndex];
        let timeout = typingSpeed;

        if (isDeleting) {
            // Lógica de Borrado (Deleting)
            cursor.setAttribute('not-animated', true);
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            timeout = deletingSpeed;

            if (charIndex === 0) {
                cursor.removeAttribute('not-animated');
                // Cuando termina de borrar, pasa a la siguiente frase
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                timeout = pauseTime; // Pausa antes de escribir la nueva frase
            }

        } else {
            // Lógica de Escritura (Typing)
            cursor.setAttribute('not-animated', true);
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            timeout = typingSpeed;

            if (charIndex === currentPhrase.length) {
                cursor.removeAttribute('not-animated');
                // Cuando termina de escribir, se prepara para borrar
                isDeleting = true;
                timeout = pauseTime; // Pausa antes de empezar a borrar
            }
        }
        // Llamar a la función nuevamente con el tiempo de retraso
        setTimeout(type, timeout);
    }

    // Iniciar el efecto de tipeo
    type();
});

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita el envío del formulario por defecto
    alert('Formulario enviado. ¡Gracias por contactarme!');
});