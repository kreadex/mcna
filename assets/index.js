const layers = {
    tg: document.querySelector('.tg-layer'),
    com: document.querySelector('.com-layer'),
    sand: document.querySelector('.sand-layer')
};

function activateLayer(name) {

    Object.values(layers).forEach(layer => layer.classList.remove('active'));

    if (name && layers[name]) {
        layers[name].classList.add('active');
    }
}

tg.addEventListener('mouseenter', () => activateLayer('tg'));
com.addEventListener('mouseenter', () => activateLayer('com'));
sand.addEventListener('mouseenter', () => activateLayer('sand'));

[tg, com, sand].forEach(btn => {
    btn.addEventListener('mouseleave', () => activateLayer(null));
});