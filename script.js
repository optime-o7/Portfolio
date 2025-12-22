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
                modifierSelector = `${defaultSelector}[${modifier}][alreadyAnimated]`;
                
                const element = document.querySelector(modifierSelector);
                const styles = window.getComputedStyle(element);
                
                for (i = 0; i < modifyingStyles.length; i++)
                {
                    n = modifyingStyles[i];
                    value = styles[n];
                    
                    finalAttrs[n] = value;
                }
            }
            
        }
        else for (i = 0; i < modifyingStyles.length; i++) finalAttrs[modifyingStyles[i]] = defaultStyle[modifyingStyles[i]];
        return finalAttrs;
    }

    function animateText(element, args = {
        breakWords: false,
        customTimeline: false,
        animateThrough: false,
        finalAttrs: {},
        commonWordStyleClass,
        modifiers: [],
        duration,
        delay,
        animation_softening,
        startTrigger: "top top",
        pinned: false,
        markers: false,
        primaryParent: "",
        parentAnimation: false,
        parentMovement: false,
        extra_elements: [{elementid: "", args: [], delay: 0}]})
    {
        let {
            breakWords = false,
            customTimeline = false,
            animateThrough = false,
            finalAttrs = {},
            commonWordStyleClass = "word",
            modifiers = [],
            duration,
            delay,
            animation_softening,
            startTrigger = "top top",
            pinned = false,
            markers = false,
            primaryParent = "",
            parentAnimation = false,
            parentMovement = false,
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
                    if (word.includes('.') && !word.includes('...')) {
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
                        m_text = "";
    
                        // check modifiers
                        modifiers.forEach((m) => 
                        {
                            for (mod of m.items) if (word.toLowerCase().includes(mod.toLowerCase())) m_text += ` ${m.name}="true"`;
                        }
                        );

                        return `<span class="${commonWordStyleClass}"${m_text}>${word}</span>`;
                    }).join('');
    
                    // Envolvemos toda la frase en un elemento de bloque (como un párrafo)
                    return `<p class="sentence-container">${contenidoFrase}</p>`;
                }).join('');
            }
            
            // 2. CREAMOS UNA TIMELINE PARA CONTROLAR EL ORDEN
            // Esto hace que las cosas pasen una tras otra o solapadas
            if (!customTimeline) {                
                tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: primaryParent,
                        start: startTrigger,
                        end: `+=${duration}%`,
                        scrub: animation_softening,
                        pin: pinned,
                        markers: markers,
                    }
                });
            }
            else tl = customTimeline;
            
            if (parentAnimation != false) tl.to(parent, parentAnimation.finalAttrs, `${parentAnimation.followThrough ? "<" : "+="}${parentAnimation.delay}`);

            if (customTimeline != false) d = duration;
            else d = 2;

            if (breakWords)
            {
                element.querySelectorAll(`.${commonWordStyleClass}`).forEach((word) => {
                    // Checkeamos si la palabra actual tiene la clase de resaltado
                    const style = word.getAttributeNames().filter(item => item != "class");

                    tl.to(word, {
                        ...getStyleObject(`.${commonWordStyleClass}`, element, style, [
                            "color",
                            "fontStyle",
                            "background-size",
                            "background-position-x"]),
                            onUpdate: () => {
                                if (animateThrough) gsap.set(word, { clearProps: "" });
                                else gsap.set(word, { clearProps: "color" });

                                word.removeAttribute("alreadyanimated");
                            },
                            onComplete: () => {
                                gsap.set(word, { clearProps: "color" });
                                word.setAttribute("alreadyanimated", "true")
                            },
                            duration: d
                    }, `<${delay}`);
                });
            }
            else
            {
                tl.to(element, { ...finalAttrs,
                    duration: d
                }, `<${delay}`);
            }
            
            for (e of extra_elements) tl.to(e.elementid, e.args, e.delay);

            if (parentMovement != false) {
                // Medimos el alto real del contenedor de texto
                children = parent.parentElement.parentElement.children;
                let parentH = parent.parentElement.getBoundingClientRect().height;
                let contentH = parent.getBoundingClientRect().height;
                
                for (i = 0; i < children.length; i++)
                {
                    if (children[i] != parent.parentElement && window.getComputedStyle(children[i]).position != "absolute") parentH -= children[i].getBoundingClientRect().height;
                }

                if (window.innerHeight < parent.getBoundingClientRect().height)
                {
                    // El cálculo mágico: lo que sobra es lo que tiene que subir
                    // Usamos un valor negativo para que suba (eje Y)
                    let distanceToMove = 0;
                    distanceToMove = -(contentH - parentH);
                    
                    tl.to(parent, {
                        // Si la distancia es positiva (el texto es más alto que la pantalla), sube.
                        // Si no, se queda en 0 para no dejar huecos.
                        y: distanceToMove < 0 ? distanceToMove : 0,
                        duration: parentMovement["duration"],
                        ease: "none" // "none" es mejor para scrolls sincronizados
                    }, parentMovement["delay"]);
                }
            }
        }
    }
    
    function animateSection(element, duration, scrub, startTrigger = "top top", pinned = false, elements = [{}], common_delay = { global: 0, text: 0, img: 0 }, markers = false)
    {
        if (element) {
            // sort            
            elements.sort((actual, siguiente) => {
                a = actual[0].order;
                b = siguiente[0].order;
                
                if (a === undefined) return 1;
                if (b === undefined) return -1;
                
                return a - b;
            });            
            
            elements.forEach(a =>{
                if (a[1].hasOwnProperty('duration')) duration += a[1].duration;
            }
            );

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: element,      // El section padre
                    start: startTrigger,       // Se pega cuando el tope del div llega al tope de la pantalla
                    end: `+=${duration}%`,          // Cuánto tiempo querés que se quede pegado (2000px de scroll)
                    scrub: scrub,             // Suavizado de la animación
                    pin: pinned,              // ¡ESTA ES LA MAGIA! Bloquea el scroll visual
                    markers: markers
                }
            });

            textDelay = common_delay.text;
            imgDelay = common_delay.img;
            globalDelay = common_delay.global;
            textIndex = 0;
            globalIndex = 0;
            localDelay = 0;
            lastOrder = null;
            
            // apply arguments
            elements.forEach(e => {
                details = e[0];                
                args = e[1];
                
                // DEFINIMOS EL PUNTO DE ENTRADA
                // Si el orden es igual al anterior, entra con "<" (mismo tiempo)
                // Si el orden cambió, entra al final de la línea de tiempo
                let posicionEntrada = (details.order === lastOrder) ? "<" : "+=0";

                if (details.hasOwnProperty('type') && details.type == "text") {
                    if (lastOrder != details.order) {
                        args.delay += textDelay * textIndex;
                        localDelay += args.delay;
                    }
                    // Si el orden es igual, NO resetees args.delay a 0 de prepo, 
                    // mejor dejá que el posicionEntrada lo maneje.

                    args.customTimeline = gsap.timeline();
                    
                    // ¡ACÁ ESTÁ LA PAPA! Agregamos la timeline en la posición calculada
                    tl.add(args.customTimeline, posicionEntrada);
                    
                    animateText(details.element, args);
                    textIndex++;
                } else {                    
                    posicionEntrada == "<" ? posicionEntrada += `${localDelay}` : posicionEntrada;

                    // Lógica para elementos que no son texto (las cards por ejemplo)
                    localTl = gsap.timeline();
                    tl.add(localTl, posicionEntrada);
                    
                    localTl.to(details.element, {
                        ...args.finalAttrs,
                        duration: args.duration
                    }); // Ponemos 0 acá porque el "delay" ya lo maneja el tl.add con posicionEntrada

                    if (lastOrder != details.order) {
                        localDelay += args.delay_between * globalIndex + imgDelay;
                        globalIndex++;
                    }
                }

                lastOrder = details.order;
            });
        }
    }

    const aboutText = document.getElementById('about-text');
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

        animateText(aboutText, {breakWords: true, commonWordStyleClass: "word", modifiers: [{name: "highlight", items: highlights}, {name: "clear", items: clears}, {name: "underline", items: underlines}], duration: 120, delay: 0.14, animation_softening: 2.5, startTrigger: "top top", pinned: true, primaryParent: "#about", parentAnimation: { finalAttrs: { "background-color": "rgba(0, 0, 0, 0.05)", duration: 1 }, delay: 0 }, parentMovement: { duration: 5, delay: 3 }, extra_elements: [{elementid: "#about-img", args: {opacity: 1, duration: 3}, delay: 1}]});
    }

    animateText(document.getElementById('about-text-2'), {breakWords: true, commonWordStyleClass: "word", modifiers: [{ name: "highlight", items: ["actually", "needs"] }, { name: "underline", items: ["we", "build", "it", "right"] }], duration: 40, delay: 500, animation_softening: 0.25, startTrigger: "top 70%"});
    
    elements = [
        [{ element: document.getElementById('projects-title'), type: "text", order: 0 }, {
        finalAttrs: { opacity: 1, color: "white" },
        commonWordStyleClass: "word",
        duration: 10,
        delay: 0.25,
        animation_softening: 0.25,
        startTrigger: "top top"}],

        [{ element: document.getElementById('projects-end-text'), type: "text" },
        {
            breakWords: true,
            animateThrough: true,
            finalAttrs: { opacity: 1, color: "white" },
            commonWordStyleClass: "word",
            modifiers: [{ name: "highlight", items: ["there's", "more"] }],
            duration: 10,
            delay: 0,
            animation_softening: 0,
            startTrigger: "top top",
            markers: true
        }]];
    
    order = 0;
    elements.forEach(e => { if (e[0].hasOwnProperty('order')) order += 1 });
    divs = document.querySelectorAll('.project_content');
    
    for (i = 0; i < divs.length; i++) elements.push([{ element: divs[i], order: (order + i) }, { finalAttrs: { opacity: 1 }, duration: 5, delay_between: 1 }]);

    animateSection(document.getElementById('projects'), 150, 2.5, "top top", true, elements, { global: 0, text: 0}, false);
    
    elements = [];
    section = document.getElementById('knowledge');
    sectionTitle = document.getElementById('knowledge-title');
    allText = section.querySelectorAll('article');
    order = 0;
    
    elements.push([{ element: sectionTitle, type: "text", order: order },{
        finalAttrs: { opacity: 1, color: "white" },
        breakWords: true,
        animateThrough: true,
        commonWordStyleClass: "word",
        duration: 50,
        delay: 5,
        animation_softening: 0.25,
        startTrigger: "top top"}]);
    
    order++;
    
    for (i = 0; i < allText.length; i++){
        elements.push([{ element: allText[i].querySelector('h3'), type: "text", order: (order + i) }, 
        {
            breakWords: true,
            animateThrough: true,
            finalAttrs: { opacity: 1, color: "white" },
            modifiers: [{ name: "highlight", items: ["html", "css", "javascript", "python", "c#"] }],
            commonWordStyleClass: "word",
            duration: 10,
            delay: 1,
            animation_softening: 0,
            startTrigger: "top top",
            markers: true
        }]);
        tArgs = elements[elements.length - 1][1]
        elements.push([{ element: allText[i].querySelector('img'), order: (order + i) }, {
            finalAttrs: { opacity: 1 },
            duration: tArgs.duration,
            delay: tArgs.delay * 1.5 }]);
    }
    
    animateSection(section, 0, 2.5, "top top", true, elements, { global: 0, text: 0, img: 0 }, false);
    animateText(document.getElementById('knowledge-tease'), {
        breakWords: true,
        animateThrough: true,
        finalAttrs: { opacity: 1, color: "white" },
        commonWordStyleClass: "word",
        duration: 50,
        delay: 0.25,
        animation_softening: 0.25,
        startTrigger: "top top",
        pinned: true}
    );
    
    elements = [];
    section = document.getElementById('ai');
    sectionTitle = document.getElementById('ai-title');
    aiText = document.getElementById('ai-text');
    aiInput = document.getElementById('ai-input');
    aiDiv = document.getElementById('result-container');

    highlights = [
        "serious",
        "Small",
        "team"
    ];
    clears = [
        "clarity"
    ];
    underlines = [
        "clean",
        "fast",
        "modern",
        "direct",
        "communication",
        "solid",
        "execution",
    ];

    order = 0;
    elements.push([{ element: sectionTitle, type: "text", order: order },{
        parentAnimation: { finalAttrs: {"background-color": "rgba(0, 0, 0, 0.2)", "backdrop-filter": "blur(20px)", "box-shadow": "0 0 20px 10px rgba(0, 0, 0, 0.25)", duration: 20}, delay: 5 },
        extra_elements: [ {elementid: "#ai-img", args: {opacity: 1, duration: 10}, followThrough: false, delay: 10} ],
        modifiers: [{ name: "multicolor", items: ["AI"] } ],
        breakWords: true,
        animateThrough: true,
        finalAttrs: { opacity: 1, color: "white" },
        commonWordStyleClass: "word",
        duration: 20,
        delay: 0.01,
        startTrigger: "top top"}]);
    
    order++;

    elements.push([{ element: aiText, type: "text", order: order }, {
        parentAnimation: { finalAttrs: { "background-color": "rgba(0, 0, 0, 0.1)", "backdrop-filter": "blur(10px)", "box-shadow": "0 0 20px 10px rgba(0, 0, 0, 0.2)", duration: 30}, delay: 5 },
        parentMovement: { duration: 20, delay: 85 },
        breakWords: true,
        finalAttrs: { opacity: 1, color: "white" },
        commonWordStyleClass: "word",
        duration: 15,
        delay: 2.5,
        startTrigger: "top top"
    }])

    elements.push([{ element: aiInput, order: order }, {
        parentAnimation: { finalAttrs: { "background-color": "rgba(0, 0, 0, 0.1)", "backdrop-filter": "blur(10px)", "box-shadow": "0 0 20px 10px rgba(0, 0, 0, 0.2)", duration: 30}, delay: 5 },
        parentMovement: { duration: 20, delay: 85 },
        breakWords: true,
        finalAttrs: { opacity: 1, color: "white" },
        commonWordStyleClass: "word",
        duration: 15,
        delay: 2.5,
        startTrigger: "top top"
    }])

    animateSection(section, 150, 0.5, "top top", true, elements, { global: 0, text: 0}, false);

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
    
    input = document.getElementById("ai-input");
    result_container = document.getElementById("result-container");

    input.addEventListener("keydown", (event) => {        
        if (event.key.toLowerCase().includes("enter") && input.value != "")
        {
            input.value = "";

            result_container.setAttribute('load', "true");
            input.style.display = "none";

            // Si querés que se pueda repetir, tenés que sacársela cuando termine
            result_container.addEventListener('animationend', (e) => {
                result_container.removeAttribute('load');
                result_container.setAttribute('loaded', "true");
            });
        }
        
    });

});