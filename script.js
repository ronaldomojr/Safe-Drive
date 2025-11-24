
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


document.getElementById("btn-voltar").addEventListener("click", () => {
    // Coloque aqui o que você quiser:
    // window.location.href = "index.html";
    // history.back();
    alert("Voltando...");
});
