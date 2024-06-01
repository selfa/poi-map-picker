let currentMap = "stormpoint"; // Define currentMap in the global scope
let loggingEnabled = false;
let orderCount = 1;

document.addEventListener("DOMContentLoaded", function() {
    const poiNames = {
        stormpoint: [
            "Checkpoint North", "Checkpoint South", "Trident", "North Pad", "Downed Beast",
            "The Mill", "Cenote Cave", "Barometer South", "Barometer North", "Ceto Station",
            "Cascade Falls", "Command Center", "The Wall", "Zeus Station", "Lightning Rod",
            "Cliff Side", "Storm Catcher", "Prowlers Nest", "Launch Pad", "Devastated Coast",
            "Echo HQ", "Coastal Camp", "The Pylon", "Jurassic", "Life"
        ],
        worldsedge: [
            "Skyhook East", "Skyhook West", "Countdown", "Lava Fissure", "Landslide",
            "Mirage a trios", "Staging", "Thermal Station", "Harvester", "The Tree",
            "Siphon West", "Siphon East", "Launch Site", "The Dome", "Stacks",
            "Big Maude", "The Geyser", "Fragment", "Monument", "Survey Camp",
            "The Epicenter", "Climatizer West", "Climatizer East", "Overlook"
        ]
    };

    const poiList = document.getElementById("poiList");
    const map1 = document.getElementById("map1");
    const map2 = document.getElementById("map2");

    loadCurrentMap();
    populatePOIList();
    loadPOIState();

    map1.addEventListener("click", logCoordinates);
    map2.addEventListener("click", logCoordinates);

    document.getElementById("pickButton").addEventListener("click", pickPOI);
    document.getElementById("removeButton").addEventListener("click", removePOI);
    document.getElementById("toggleLoggingButton").addEventListener("click", toggleLogging);
    document.getElementById("resetButton").addEventListener("click", resetPOIState);

    document.getElementById("map1Button").addEventListener("click", function() {
        switchMap("stormpoint");
    });

    document.getElementById("map2Button").addEventListener("click", function() {
        switchMap("worldsedge");
    });

    function populatePOIList() {
        poiList.innerHTML = '<option value="" disabled selected>Select POI</option>';
        for (let i = 0; i < poiNames[currentMap].length; i++) {
            let option = document.createElement("option");
            option.value = i + 1;
            option.text = poiNames[currentMap][i] + " #" + (i + 1);
            poiList.appendChild(option);
        }
    }

    function switchMap(mapId) {
        currentMap = mapId;

        document.getElementById("map1").style.display = "none";
        document.getElementById("map2").style.display = "none";
        document.getElementById(mapId === "stormpoint" ? "map1" : "map2").style.display = "block";

        document.getElementById("stormpoint-pois").style.display = "none";
        document.getElementById("worldsedge-pois").style.display = "none";
        document.getElementById(`${mapId}-pois`).style.display = "block";

        populatePOIList();
        saveCurrentMap();
        loadPOIState();
    }

    function saveCurrentMap() {
        localStorage.setItem('currentMap', currentMap);
    }

    function loadCurrentMap() {
        const savedMap = localStorage.getItem('currentMap');
        if (savedMap) {
            currentMap = savedMap;
            switchMap(currentMap);
        } else {
            switchMap('stormpoint');
        }
    }

    function toggleLogging() {
        loggingEnabled = !loggingEnabled;
        alert(loggingEnabled ? "Coordinate logging enabled" : "Coordinate logging disabled");
    }

    function logCoordinates(event) {
        if (!loggingEnabled) return;

        const map = event.currentTarget;
        const rect = map.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        alert(`Top: ${y}px; Left: ${x}px;`);
    }

    function pickPOI() {
        const teamName = document.getElementById("teamName").value;
        const poiList = document.getElementById("poiList");
        const poiNumber = poiList.value;
        const poiElement = document.getElementById(currentMap + "-poi-" + poiNumber);

        if (poiElement.style.backgroundColor === "green") {
            alert("This POI has already been picked. Please select another POI.");
            return;
        }

        if (teamName && poiNumber) {
            poiElement.style.backgroundColor = "green";
            poiElement.textContent = poiElement.textContent.split(" - ")[0] + ` - ${teamName}`;
            document.getElementById("teamName").value = "";

            const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
            const newRow = poiTable.insertRow();
            newRow.insertCell(0).innerText = poiList.options[poiList.selectedIndex].text;
            newRow.insertCell(1).innerText = teamName;
            newRow.insertCell(2).innerText = orderCount++;
            newRow.style.backgroundColor = "green";
            newRow.setAttribute("data-poi", currentMap + "-poi-" + poiNumber);

            savePOIState();
        } else {
            alert("Please enter a team name and select a POI.");
        }
    }

    function removePOI() {
        const poiList = document.getElementById("poiList");
        const poiNumber = poiList.value;
        const poiElement = document.getElementById(currentMap + "-poi-" + poiNumber);

        if (poiNumber) {
            const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
            const rows = poiTable.rows;
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].getAttribute("data-poi") === currentMap + "-poi-" + poiNumber) {
                    poiTable.deleteRow(i);
                    break;
                }
            }

            poiElement.style.backgroundColor = "red";
            poiElement.textContent = poiNumber;

            recalculateDraftNumbers();

            savePOIState();
        } else {
            alert("Please select a POI to remove.");
        }
    }

    function resetPOIState() {
        const maps = ["stormpoint", "worldsedge"];
        maps.forEach(mapId => {
            const poiElements = document.querySelectorAll(`#${mapId}-pois .poi`);
            poiElements.forEach(poi => {
                poi.style.backgroundColor = "red";
                poi.textContent = poi.id.split('-').slice(-1)[0];
            });
        });

        const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
        poiTable.innerHTML = '';

        orderCount = 1;
        localStorage.removeItem('poiState-stormpoint');
        localStorage.removeItem('poiState-worldsedge');
        localStorage.removeItem('poiTableState-stormpoint');
        localStorage.removeItem('poiTableState-worldsedge');
        localStorage.removeItem('currentMap');
    }

    function savePOIState() {
        const poiElements = document.querySelectorAll(`#${currentMap}-pois .poi`);
        const poiState = Array.from(poiElements).map(poi => ({
            id: poi.id,
            textContent: poi.textContent,
            backgroundColor: poi.style.backgroundColor
        }));
        localStorage.setItem(`poiState-${currentMap}`, JSON.stringify(poiState));

        const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
        const poiTableState = Array.from(poiTable.rows).map(row => ({
            poi: row.cells[0].innerText,
            teamName: row.cells[1].innerText,
            draft: row.cells[2].innerText,
            dataPoi: row.getAttribute("data-poi")
        }));
        localStorage.setItem(`poiTableState-${currentMap}`, JSON.stringify(poiTableState));
    }

    function loadPOIState() {
        const poiState = JSON.parse(localStorage.getItem(`poiState-${currentMap}`));
        if (poiState) {
            poiState.forEach(state => {
                const poiElement = document.getElementById(state.id);
                if (poiElement) {
                    poiElement.textContent = state.textContent;
                    poiElement.style.backgroundColor = state.backgroundColor;
                }
            });
        }

        const poiTableState = JSON.parse(localStorage.getItem(`poiTableState-${currentMap}`));
        if (poiTableState) {
            const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
            poiTable.innerHTML = '';
            poiTableState.forEach(row => {
                const newRow = poiTable.insertRow();
                newRow.insertCell(0).innerText = row.poi;
                newRow.insertCell(1).innerText = row.teamName;
                newRow.insertCell(2).innerText = row.draft;
                newRow.style.backgroundColor = "green";
                newRow.setAttribute("data-poi", row.dataPoi);
            });
            orderCount = poiTableState.length + 1;
        }
    }

    function recalculateDraftNumbers() {
        const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
        const rows = poiTable.rows;
        for (let i = 0; i < rows.length; i++) {
            rows[i].cells[2].innerText = i + 1; // Reassign draft numbers
        }
        orderCount = rows.length + 1;
    }
});
