document.addEventListener('DOMContentLoaded', () => {
    // 1. Footer
    const footer = document.getElementById('copyright-footer');
    if (footer) footer.textContent = `©JOMA Studios ${new Date().getFullYear()}. All rights reserved.`;

    // Navbar
    const nav = document.querySelector('nav');
    let lastScrollY = window.scrollY;
    let accumulatedDelta = 0;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const diff = currentScrollY - lastScrollY;
        
        // Definimos la tolerancia relativa: 5% del alto de la pantalla
        const thresholdDown = window.innerHeight * .15; 
        const thresholdUp = window.innerHeight * 0.05; // Más sensible para volver

        accumulatedDelta += diff;
        scrolling = false

        // Si scrolleamos para abajo más del 5% de la pantalla
        if (accumulatedDelta > thresholdDown && currentScrollY > 100 && !scrolling) {
            scrolling = true;
            gsap.to(nav, { 
                yPercent: -150, 
                duration: 0.4, 
                ease: "power2.inOut",
                overwrite: "auto",
                onEnd: () => scrolling = false
            });
            accumulatedDelta = 0;
        } 
        // Si subimos un cachito (2% de la pantalla)
        else if (accumulatedDelta < -thresholdUp || currentScrollY <= 0) {
            gsap.to(nav, { 
                yPercent: 0, 
                duration: 0.4, 
                ease: "power1.out",
                overwrite: "auto"
            });
            accumulatedDelta = 0;
        }

        lastScrollY = currentScrollY;
    }, { passive: true }); // 'passive' mejora el rendimiento del scroll

    /* About-text */
    gsap.registerPlugin(ScrollTrigger);
    
    const aboutText = document.getElementById('about-text');
    const aboutText2 = document.getElementById('about-text-2');
    words = [];
    if (aboutText) {
        let filteredW = [];
        let currentSentence = []; // El sub-array donde guardamos las palabras actuales

        for (let word of aboutText.textContent.trim().split(/\s+/)) {
            if (word.includes('.')) {
                // Si tiene punto, lo agregamos al sub-array actual
                w = word.split('.');
                currentSentence.push(w[0] + '.'); // Agregamos la palabra con el punto
                // Guardamos el grupo de palabras en el array principal
                filteredW.push(currentSentence);
                // Reseteamos el sub-array para la próxima tanda
                currentSentence = [];
                if (w[1] != "") currentSentence.push(w[1]); // Empezamos la nueva "oración" con lo que venga después del punto
            } else {
                // Si no tiene punto, sigue sumando a la "oración" actual
                currentSentence.push(word);
            }
        }

        // Por si quedó algo colgado al final sin punto
        if (currentSentence.length > 0) filteredW.push(currentSentence);

        words.push(filteredW);
        words.push(aboutText2.textContent.split(/\s+/));

        // 1. Separar en palabras (lo mantenemos igual)
        // Suponiendo que words[0] es tu array de arrays (matriz)
        aboutText.innerHTML = words[0].map((frase) => {
            // Procesamos cada palabra de la frase actual
            const contenidoFrase = frase.map(word => {     
                highlights = [
                    "serious",
                    "Small",
                    "team"
                ]
                clears = [
                    "clarity"
                ]
                underlines = [
                    "clean",
                    "fast",
                    "modern",
                    "direct",
                    "communication",
                    "solid",
                    "execution",
                ]
                modifiers = "";

                // check highlights & underlines
                for (highlight of highlights) if (word.toLowerCase().includes(highlight.toLowerCase())) modifiers += ' highlight="true"';
                for (clear of clears) if (word.toLowerCase().includes(clear.toLowerCase())) modifiers += ' clear="true"';
                for (underline of underlines) if (word.toLowerCase().includes(underline.toLowerCase())) modifiers += ' underline="true"';
                
                return `<span class="word"${modifiers}>${word}</span>`;
            }).join('');

            // Envolvemos toda la frase en un elemento de bloque (como un párrafo)
            return `<p class="sentence-container">${contenidoFrase}</p>`;
        }).join('');
        aboutText2.innerHTML = words[1].map(word => {
            if (word.toLowerCase().includes('actually') || word.toLowerCase().includes('needs,')) {
                return `<span class="word-highlighted">${word}&nbsp;</span>`;
            } else {
                return `<span class="word2">${word}&nbsp;</span>`;
            }
        }).join('');

        function getStyleObject(defaultSelector, modifiers, modifyingStyles) {
            const defaultElement = document.querySelector(defaultSelector);
            const defaultStyle = window.getComputedStyle(defaultElement);

            finalAttrs = {
                opacity: defaultStyle.opacity,
                fontSize: defaultStyle.fontSize,
                letterSpacing: defaultStyle.letterSpacing
            }

            if (modifiers.length != 0)
            {                               
                for (modifier of modifiers){
                    modifierSelector = `${defaultSelector}[${modifier}]`;
                    const element = document.querySelector(modifierSelector);
                    const styles = window.getComputedStyle(element);

                    for (i = 0; i < modifyingStyles.length; i++)
                    {
                        n = modifyingStyles[i];
                        value = styles[n];
                        
                        if (value != defaultStyle[n]) finalAttrs[n] = value;
                    }
                }
                
            }
            else for (i = 0; i < modifyingStyles.length; i++) finalAttrs[modifyingStyles[i]] = defaultStyle[modifyingStyles[i]];

            return finalAttrs;
        }

        // 2. CREAMOS UNA TIMELINE PARA CONTROLAR EL ORDEN
        // Esto hace que las cosas pasen una tras otra o solapadas
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#about",      // El section padre
                start: "top top",       // Se pega cuando el tope del div llega al tope de la pantalla
                end: "+=120%",          // Cuánto tiempo querés que se quede pegado (2000px de scroll)
                scrub: 2.5,             // Suavizado de la animación
                pin: true,              // ¡ESTA ES LA MAGIA! Bloquea el scroll visual
                markers: false
            }
        });
        const tTl = gsap.timeline({
            scrollTrigger: {
                trigger: "#about-title",      // El section padre
                start: "top 100%",       // Se pega cuando el tope del div llega al tope de la pantalla
                end: "+=80%",          // Cuánto tiempo querés que se quede pegado (2000px de scroll)
                scrub: 0.25,             // Suavizado de la animación
                pin: false,              // ¡ESTA ES LA MAGIA! Bloquea el scroll visual
                markers: false
            }
        });

        // 3. SECUENCIA DE ANIMACIONES
        tTl.to("#about-title", { opacity: 1, duration: 1 });
        tl.to("#about-container", { "background-color": "rgba(0, 0, 0, 0.05)", duration: 1 }, "<");

        document.querySelectorAll(".word").forEach((word) => {
            // Checkeamos si la palabra actual tiene la clase de resaltado
            const style = word.getAttributeNames().filter(item => item != "class");
            selectorPrefab = `.word-style`;
            frames = 0;
            half = false;

            tl.to(word, {
                ...getStyleObject(selectorPrefab, style,[
                    "color",
                    "fontStyle"]),// Se ejecuta UNA SOLA VEZ cuando la animación vuelve al inicio (reversa)
                    onUpdate: () => {
                        gsap.set(word, { clearProps: "color" }); // Limpiamos por si las dudas
                        word.removeAttribute("alreadyAnimated");
                    },
                    onComplete: () => {
                        gsap.set(word, { clearProps: "color" });
                        word.setAttribute("alreadyAnimated", "true");
                    },
                    duration: 2
            }, "<0.14"); // El "<0.1" hace el efecto de stagger manualmente
        });

        // Segundo: entra la imagen (empieza un poquito antes de que termine el título)
        tl.to("#about-img", { opacity: 1, duration: 3 }, 1);
        // Medimos el alto real del contenedor de texto
        const aboutContent = document.querySelector("#about-container");
        const containerHeight = aboutContent.offsetHeight;
        const windowHeight = window.innerHeight;

        // El cálculo mágico: lo que sobra es lo que tiene que subir
        // Usamos un valor negativo para que suba (eje Y)
        const distanceToMove = -(containerHeight/6);

        tl.to("#about-container", {
            // Si la distancia es positiva (el texto es más alto que la pantalla), sube.
            // Si no, se queda en 0 para no dejar huecos.
            y: distanceToMove < 0 ? distanceToMove : 0,
            duration: 5,
            ease: "none" // "none" es mejor para scrolls sincronizados
        }, 3);
        
    }
    // Seleccionamos todas las palabras con efecto vidrio
    const glassWords = document.querySelectorAll('.word[clear]');

    glassWords.forEach(word => {
        word.addEventListener('mousemove', (e) => {
            // Calculamos la posición del mouse dentro del elemento
            const rect = word.getBoundingClientRect();
            const x = e.clientX - rect.left;
            
            // Convertimos a porcentaje para la variable CSS
            const percent = (x / rect.width) * 100;
            
            // Actualizamos la variable en el estilo inline
            word.style.setProperty('--x', `${percent}%`);
        });
        
        // Opcional: Volver el brillo al centro cuando el mouse se va
        word.addEventListener('mouseleave', () => {
            gsap.to(word, { "--x": "50%", duration: 0.5 });
        });
    });

    /* --- EFECTO TYPEWRITER (Se queda igual) ---*/
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

    // Project Buttons
    const cards = document.querySelectorAll('.project_content');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // Coordenadas relativas al centro
            const mouseX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
            const mouseY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
            
            const maxRotation = 15;

            gsap.to(card, {
                rotateY: mouseX * maxRotation,
                rotateX: -mouseY * maxRotation,
                scale: 1.15,       // HACEMOS EL ZOOM ACÁ
                zIndex: 10,       // Lo traemos al frente para que no se pise
                duration: 1,    // Un poquito más de duración para que no vibre
                ease: "power2.out",
                overwrite: "auto" // ¡CLAVE! Mata animaciones anteriores para que no se trabe
            });
        });

        // Efecto cuando APRETÁS el click
        card.addEventListener('mousedown', () => {
            gsap.to(card, {
                scale: 1.05,   // Se hunde un poquito
                duration: 0.01,
                ease: "power2.out"
            });
        });

        // Efecto cuando SOLTÁS el click
        card.addEventListener('mouseup', () => {
            gsap.to(card, {
                scale: 1.15,       // Vuelve al tamaño de hover
                duration: 0.01,
                ease: "back.out(2)" // Un pequeño rebote para que se note el "release"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                scale: 1,         // VOLVEMOS AL TAMAÑO ORIGINAL
                zIndex: 1,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)",
                overwrite: "auto"
            });
        });
    });
});