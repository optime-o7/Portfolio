document.addEventListener('DOMContentLoaded', () => {
    //              --- Footer ---
    const footer = document.getElementById('copyright-footer');
    if (footer) footer.textContent = `©JOMA Studios ${new Date().getFullYear()}. All rights reserved.`;

    //          --- Navbar ---
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
                onComplete: () => scrolling = false
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

    //      --- About Text ---
    gsap.registerPlugin(ScrollTrigger);
    
    function getStyleObject(defaultSelector, parentClass, modifiers, modifyingStyles) {
        const defaultStyle = window.getComputedStyle(parentClass);

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

    function animateText(element, args = {
        breakWords: false,
        finalAttrs: {},
        commonWordStyleClass,
        highlights: [],
        clears: [],
        underlines: [],
        duration,
        delay,
        animation_softening,
        startTrigger: "top top",
        pinned: false,
        markers: false,
        primaryParent: "",
        parentAnimation: false,
        parentArgs: {movement_ratio: 6, duration: 5, delay: 3},
        extra_elements: [{elementid: "", args: [], delay: 0}]})
    {
        let {
            breakWords = false,
            finalAttrs = {},
            commonWordStyleClass = "word",
            highlights = [],
            clears = [],
            underlines = [],
            duration,
            delay,
            animation_softening,
            startTrigger = "top top",
            pinned = false,
            markers = false,
            primaryParent = "",
            parentAnimation = false,
            parentArgs = { movement_ratio: 6, duration: 5, delay: 3 },
            extra_elements = [{ elementid: "", args: [], delay: 0 }]} = args;
        
        parent = element.parentElement;
        if (primaryParent == "") primaryParent = parent;

        if (element) {
            if (breakWords)
            {
                let filteredW = [];
                let currentSentence = []; // El sub-array donde guardamos las palabras actuales
                let words = [];
    
                for (let word of element.textContent.trim().split(/\s+/)) {
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
    
                // 1. Separar en palabras
                element.innerHTML = words[0].map((frase) => {
                    // Procesamos cada palabra de la frase actual
                    const contenidoFrase = frase.map(word => {
                        modifiers = "";
    
                        // check highlights & underlines
                        for (highlight of highlights) if (word.toLowerCase().includes(highlight.toLowerCase())) modifiers += ' highlight="true"';
                        for (clear of clears) if (word.toLowerCase().includes(clear.toLowerCase())) modifiers += ' clear="true"';
                        for (underline of underlines) if (word.toLowerCase().includes(underline.toLowerCase())) modifiers += ' underline="true"';
                        
                        return `<span class="${commonWordStyleClass}"${modifiers}>${word}</span>`;
                    }).join('');
    
                    // Envolvemos toda la frase en un elemento de bloque (como un párrafo)
                    return `<p class="sentence-container">${contenidoFrase}</p>`;
                }).join('');
            }

            // 2. CREAMOS UNA TIMELINE PARA CONTROLAR EL ORDEN
            // Esto hace que las cosas pasen una tras otra o solapadas
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: primaryParent,
                    start: startTrigger,
                    end: `+=${duration}%`,
                    scrub: animation_softening,
                    pin: pinned,
                    markers: markers,
                }
            });

            if (parentAnimation) tl.to(parent, { "background-color": "rgba(0, 0, 0, 0.05)", duration: 1 }, "<");

            if (breakWords)
            {
                element.querySelectorAll(`.${commonWordStyleClass}`).forEach((word) => {
                    // Checkeamos si la palabra actual tiene la clase de resaltado
                    const style = word.getAttributeNames().filter(item => item != "class");
                    
                    tl.to(word, {
                        ...getStyleObject(`.${commonWordStyleClass}`, element, style,[
                            "color",
                            "fontStyle"]),
                            onUpdate: () => {
                                gsap.set(word, { clearProps: "color" });
                                word.removeAttribute("alreadyanimated");},
                            onComplete: () => word.setAttribute("alreadyanimated", "true"),
                            duration: 2
                    }, `<${delay}`);
                });
            }
            else
            {
                tl.to(element, { ...finalAttrs,
                    duration: 2
                }, `<${delay}`);
            }
            
            for (e of extra_elements) tl.to(e.elementid, e.args, e.delay);

            if (parentAnimation && pinned) {
                // Medimos el alto real del contenedor de texto
                const aboutContent = parent;
                const containerHeight = aboutContent.offsetHeight;
                const windowHeight = window.innerHeight;
                
                // El cálculo mágico: lo que sobra es lo que tiene que subir
                // Usamos un valor negativo para que suba (eje Y)
                const distanceToMove = -(containerHeight/parentArgs["movement_ratio"]);

                tl.to(parent, {
                    // Si la distancia es positiva (el texto es más alto que la pantalla), sube.
                    // Si no, se queda en 0 para no dejar huecos.
                    y: distanceToMove < 0 ? distanceToMove : 0,
                    duration: parentArgs["duration"],
                    ease: "none" // "none" es mejor para scrolls sincronizados
                }, parentArgs["delay"]);
            }
        }
    }
    
    function animateSection(element, duration, animationDuration, startTrigger = "top top", pinned = false, elements = [{}], common_delay = { global: 0, text: 0 }, markers = false)
    {
        if (element) {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: element,      // El section padre
                    start: startTrigger,       // Se pega cuando el tope del div llega al tope de la pantalla
                    end: `+=${duration}%`,          // Cuánto tiempo querés que se quede pegado (2000px de scroll)
                    scrub: 2.5,             // Suavizado de la animación
                    pin: pinned,              // ¡ESTA ES LA MAGIA! Bloquea el scroll visual
                    markers: markers
                }
            });

            // organizar
            elements.forEach(e => {
                console.log(e);
                
            });
            
            for (i = 0; i < textargs.length; i++)
            {
                
            }
            // aplicar arguments
            for (i = 0; i < textargs["args"].length; i){
                e = textargs["args"][i];
                i = 1;
                e[1]["delay"] += i * textargs["delay_between"];
                animateText(...e);
            }

            elementsargs.forEach(finalAttrs => {                
                tl.to(finalAttrs[0], {...finalAttrs[1]["finalAttrs"],
                    duration: 2
                }, `<${finalAttrs[1]["delay_between"] * i + common_delay}`);
                common_delay++;
            });
        }
    }

    const aboutText = document.getElementById('about-text');

    words = [];
    if (aboutText) {
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

        animateText(aboutText, {breakWords: true, commonWordStyleClass: "word", highlights: highlights, clears: clears, underlines: underlines, duration: 120, delay: 0.14, animation_softening: 2.5, startTrigger: "top top", pinned: true, primaryParent: "#about", parentAnimation: true, parentArgs: { movement_ratio: 6, duration: 5, delay: 3 }, extra_elements: [{elementid: "#about-img", args: {opacity: 1, duration: 3}, delay: 1}]});
    }

    animateText(document.getElementById('about-text-2'), {breakWords: true, commonWordStyleClass: "word", highlights: ["actually", "needs"], clears: [], underlines: ["we", "build", "it", "right"], duration: 40, delay: 500, animation_softening: 0.25, startTrigger: "top 70%"});
    
    elements = [
        [{ element: document.getElementById('projects-title'), type: "text", order: 0 }, {
        finalAttrs: { opacity: 1, color: "white" },
        commonWordStyleClass: "word",
        duration: 30,
        delay: 0.25,
        animation_softening: 0.25,
        startTrigger: "top top",}],

        [{ element: document.getElementById('projects-end-text'), type: "text" },
        {
            finalAttrs: { opacity: 1, color: "white" },
            commonWordStyleClass: "word",
            duration: 30,
            delay: 0.25,
            animation_softening: 0.25,
            startTrigger: "top top",}]];
    
    i = 0;
    elements.forEach(e => { if (e[0].hasOwnProperty('order')) i += 1 });
    divs = document.querySelectorAll('.project_content');
    
    for (; i < divs.length; i++) divs.forEach(element => {
        elements.push([{ element: element, order: (i) }, { finalAttrs: { opacity: 1 }, delay_between: 1 }]);
    });    

    animateSection(document.getElementById('projects'), 150, 0, "top top", true, elements, { global: 0, text: 0}, false);
    
    //              --- Glass words ---
    
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

    //          --- TypeWrite Effect ---

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

    //          --- Project Buttons ---

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
                scale: 1,       // HACEMOS EL ZOOM ACÁ
                zIndex: 10,       // Lo traemos al frente para que no se pise
                duration: 1,    // Un poquito más de duración para que no vibre
                ease: "power2.out",
                overwrite: "auto" // ¡CLAVE! Mata animaciones anteriores para que no se trabe
            });
        });

        // Efecto cuando APRETÁS el click
        card.addEventListener('mousedown', () => {
            gsap.to(card, {
                scale: 0.95,   // Se hunde un poquito
                duration: 0.5,
                ease: "power2.out"
            });
        });

        // Efecto cuando SOLTÁS el click
        card.addEventListener('mouseup', () => {
            gsap.to(card, {
                scale: 1,       // Vuelve al tamaño de hover
                duration: 0.5,
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