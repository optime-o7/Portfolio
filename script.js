document.addEventListener('DOMContentLoaded', () => {
    // 1. Footer
    const footer = document.getElementById('copyright-footer');
    if (footer) footer.textContent = `©JOMA Studios ${new Date().getFullYear()}. All rights reserved.`;

    // Registramos el plugin
    gsap.registerPlugin(ScrollTrigger);

    const aboutText = document.getElementById('about-text');
    if (aboutText) {
        // 1. Separar en palabras (lo mantenemos igual)
        const words = aboutText.textContent.split(/\s+/);
        aboutText.innerHTML = words.map(word => `<span class="word">${word}&nbsp;</span>`).join('');

        // 2. CREAMOS UNA TIMELINE PARA CONTROLAR EL ORDEN
        // Esto hace que las cosas pasen una tras otra o solapadas
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#about",      // El section padre
                start: "top top",       // Se pega cuando el tope del div llega al tope de la pantalla
                end: "+=800",          // Cuánto tiempo querés que se quede pegado (2000px de scroll)
                scrub: 2.5,             // Suavizado de la animación
                pin: true,              // ¡ESTA ES LA MAGIA! Bloquea el scroll visual
                markers: true
            }
        });
        const tTl = gsap.timeline({
            scrollTrigger: {
                trigger: "#about-title",      // El section padre
                start: "top 100%",       // Se pega cuando el tope del div llega al tope de la pantalla
                end: "+=300",          // Cuánto tiempo querés que se quede pegado (2000px de scroll)
                scrub: 0.25,             // Suavizado de la animación
                pin: false,              // ¡ESTA ES LA MAGIA! Bloquea el scroll visual
                markers: false
            }
        });

        gsap.set("#about-img", { 
            clearProps: "height", // Borra cualquier altura que haya metido GSAP antes
            height: "auto" 
        });

        // 3. SECUENCIA DE ANIMACIONES
        
        tTl.to("#about-title", { opacity: 1, duration: 1 });

        tl.to(".word", {
            opacity: 1,
            stagger: 0.1,
            duration: 2 // Le damos más duración para que se sienta lento
        });

        // Segundo: entra la imagen (empieza un poquito antes de que termine el título)
        tl.to("#about-img", { opacity: 1, duration: 3 }, 2);
        
        tl.to("#about-container", {
            y: -250,
            duration: 5
        }, 3.5);
    }

    // --- EFECTO TYPEWRITER (Se queda igual) ---
    const textElement = document.getElementById('home__dynamic__text');
    const phrases = ["surprise.", "works.", "solutions.", "results."];
    let phraseIndex = 0, charIndex = 0, isDeleting = false;

    function type() {
        const currentPhrase = phrases[phraseIndex];
        let timeout = isDeleting ? 50 : 100;
        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                timeout = 1500;
            }
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            if (charIndex === currentPhrase.length) {
                isDeleting = true;
                timeout = 1500;
            }
        }
        setTimeout(type, timeout);
    }
    if (textElement) type();
});

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita el envío del formulario por defecto
    const formData = new FormData(this);
    const email = formData.get('email');
    const context = formData.get('context');
    const message = formData.get('message');

    fetch('/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, context, message })
    });
    alert('Formulario enviado. ¡Gracias por contactarme!');
});