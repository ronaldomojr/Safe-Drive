
const map = L.map('map').setView([-22.5087, -44.0938], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

const SearchControl = L.Control.extend({
    onAdd: function () {
        const container = L.DomUtil.create("div", "search-card");

        container.innerHTML = `
            <div class="search-box">
                <img src="https://cdn-icons-png.flaticon.com/512/54/54481.png" class="icon-left">
                <input type="text" placeholder="Para onde você está indo?">
                <img src="https://cdn-icons-png.flaticon.com/512/709/709631.png" class="icon-right">
            </div>

            <div class="recent-title">Locais recentes</div>

            <div class="recent-item">
                <div class="recent-item-left">
                    <img src="https://cdn-icons-png.flaticon.com/512/1946/1946433.png">
                    <div>
                        <div>Casa</div>
                        <div class="subtitle">Defina uma vez e pronto</div>
                    </div>
                </div>
                <img src="https://cdn-icons-png.flaticon.com/512/271/271228.png" width="16">
            </div>

            <div class="recent-item">
                <div class="recent-item-left">
                    <img src="https://cdn-icons-png.flaticon.com/512/3103/3103446.png">
                    <div>
                        <div>Trabalho</div>
                        <div class="subtitle">Defina uma vez e pronto</div>
                    </div>
                </div>
                <img src="https://cdn-icons-png.flaticon.com/512/271/271228.png" width="16">
            </div>
        `;

        // Evita zoom/drag quando usar o card
        L.DomEvent.disableScrollPropagation(container);
        L.DomEvent.disableClickPropagation(container);

        return container;
    }
});

map.addControl(new SearchControl({ position: "topleft" }));

// Dados de localizações com batidas e obras
const locations = {
    1: {
        lat: -22.5087,
        lng: -44.0938,
        type: 'batida',
        user: 'Lucas',
        description: 'Batida - Mesmo ponto recorrente'
    },
    3: {
        lat: -22.515,
        lng: -44.085,
        type: 'batida',
        user: 'Eduarda',
        description: 'Batida - Cruzamento sem semáforo'
    },
    5: {
        lat: -22.505,
        lng: -44.095,
        type: 'obra',
        user: 'Julio',
        description: 'Obra - Via principal'
    },
    6: {
        lat: -22.495,
        lng: -44.100,
        type: 'obra',
        user: 'Roberto',
        description: 'Obra - Em andamento'
    }
};

// Criar ícones customizados
const batidaIcon = L.divIcon({
    html: '<div style="background-color: #E74C3C; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-car" style="color: white; font-size: 12px;"></i></div>',
    iconSize: [24, 24],
    className: 'custom-icon'
});

const obraIcon = L.divIcon({
    html: '<div style="background-color: #F39C12; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-tools" style="color: white; font-size: 12px;"></i></div>',
    iconSize: [24, 24],
    className: 'custom-icon'
});

// Adicionar marcadores ao mapa
const markers = {};
Object.entries(locations).forEach(([id, location]) => {
    const icon = location.type === 'batida' ? batidaIcon : obraIcon;
    const marker = L.marker([location.lat, location.lng], { icon: icon })
        .bindPopup(`<strong>${location.user}</strong><br>${location.description}`)
        .addTo(map);
    
    markers[id] = marker;
});

// Adicionar interatividade ao clica nos ícones de localização
document.querySelectorAll('.location-indicator').forEach(indicator => {
    indicator.addEventListener('click', (e) => {
        e.stopPropagation();
        const locationId = indicator.dataset.locationId;
        const location = locations[locationId];
        
        if (location && markers[locationId]) {
            // Fazer zoom e focar no marcador
            map.setView([location.lat, location.lng], 16);
            markers[locationId].openPopup();
            
            // Destacar o cartão
            const card = document.querySelector(`[data-post-id="${locationId}"]`);
            if (card) {
                card.style.borderLeft = '4px solid #E74C3C';
                setTimeout(() => {
                    card.style.borderLeft = 'none';
                }, 2000);
            }
        }
    });
});

// Cliques nos marcadores para focar no card
Object.entries(markers).forEach(([id, marker]) => {
    marker.on('click', () => {
        const card = document.querySelector(`[data-post-id="${id}"]`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.borderLeft = '4px solid #F39C12';
            setTimeout(() => {
                card.style.borderLeft = 'none';
            }, 2000);
        }
    });
});
