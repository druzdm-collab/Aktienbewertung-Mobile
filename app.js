"use strict";


// ============================================================
// AKTIENBEWERTUNG - LOKALE PWA
// Buffett-orientierte Bewertungslogik
//
// Bewertungskennzahl:
// Basis-KGV / (1 + Gewinnwachstum)
//
// Entscheidung:
// <= Grün        -> Kauf
// <= Gelb        -> Aufbau
// <= Orange      -> Beobachten
// > Orange       -> Kein Kauf
//
// Sortierung:
// Prozentualer Abstand des aktuellen Kurses
// zum Top-Kaufkurs, aufsteigend.
// ============================================================


const DB_NAME = "AktienbewertungMobile";
const DB_VERSION = 1;

const STOCKS_STORE = "stocks";
const BRANCHES_STORE = "branches";

let editingStockId = null;


// ============================================================
// STANDARD-BRANCHEN
// ============================================================

const DEFAULT_BRANCHES = [

    {
        name: "Automobil",
        kgv_gruen: 9,
        kgv_gelb: 12,
        kgv_orange: 15
    },

    {
        name: "Börsen / Finanzinfrastruktur",
        kgv_gruen: 18,
        kgv_gelb: 23,
        kgv_orange: 28
    },

    {
        name: "Chemie",
        kgv_gruen: 12,
        kgv_gelb: 16,
        kgv_orange: 20
    },

    {
        name: "Einzelhandel",
        kgv_gruen: 12,
        kgv_gelb: 16,
        kgv_orange: 20
    },

    {
        name: "Energie",
        kgv_gruen: 10,
        kgv_gelb: 14,
        kgv_orange: 18
    },

    {
        name: "Finanzen",
        kgv_gruen: 10,
        kgv_gelb: 13,
        kgv_orange: 16
    },

    {
        name: "Getränke / Marken-Konsum",
        kgv_gruen: 17,
        kgv_gelb: 21,
        kgv_orange: 25
    },

    {
        name: "Grundstoffe / Rohstoffe",
        kgv_gruen: 10,
        kgv_gelb: 14,
        kgv_orange: 18
    },

    {
        name: "Halbleiter",
        kgv_gruen: 15,
        kgv_gelb: 20,
        kgv_orange: 25
    },

    {
        name: "Industrie",
        kgv_gruen: 14,
        kgv_gelb: 18,
        kgv_orange: 22
    },

    {
        name: "IT + Software",
        kgv_gruen: 20,
        kgv_gelb: 25,
        kgv_orange: 30
    },

    {
        name: "Konsum",
        kgv_gruen: 17,
        kgv_gelb: 22,
        kgv_orange: 27
    },

    {
        name: "Logistik",
        kgv_gruen: 12,
        kgv_gelb: 16,
        kgv_orange: 20
    },

    {
        name: "Luxus",
        kgv_gruen: 18,
        kgv_gelb: 23,
        kgv_orange: 28
    },

    {
        name: "Medien / Unterhaltung",
        kgv_gruen: 12,
        kgv_gelb: 16,
        kgv_orange: 20
    },

    {
        name: "Medizintechnik",
        kgv_gruen: 20,
        kgv_gelb: 25,
        kgv_orange: 30
    },

    {
        name: "Pharma",
        kgv_gruen: 14,
        kgv_gelb: 18,
        kgv_orange: 22
    },

    {
        name: "Rüstung",
        kgv_gruen: 15,
        kgv_gelb: 20,
        kgv_orange: 25
    },

    {
        name: "Telekommunikation",
        kgv_gruen: 11,
        kgv_gelb: 15,
        kgv_orange: 18
    },

    {
        name: "Unternehmensdienstleistungen / Informationsdienstleistungen",
        kgv_gruen: 18,
        kgv_gelb: 23,
        kgv_orange: 28
    },

    {
        name: "Versicherung",
        kgv_gruen: 12,
        kgv_gelb: 15,
        kgv_orange: 18
    },

    {
        name: "Versorger",
        kgv_gruen: 10,
        kgv_gelb: 14,
        kgv_orange: 17
    },

    {
        name: "Zahlungsdienstleister",
        kgv_gruen: 18,
        kgv_gelb: 24,
        kgv_orange: 28
    }

];


// ============================================================
// INDEXEDDB
// ============================================================

function openDatabase() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            request.onupgradeneeded =
                function(event) {

                    const db =
                        event.target.result;


                    if (
                        !db.objectStoreNames.contains(
                            STOCKS_STORE
                        )
                    ) {

                        db.createObjectStore(
                            STOCKS_STORE,
                            {
                                keyPath: "id",
                                autoIncrement: true
                            }
                        );
                    }


                    if (
                        !db.objectStoreNames.contains(
                            BRANCHES_STORE
                        )
                    ) {

                        const branchStore =
                            db.createObjectStore(
                                BRANCHES_STORE,
                                {
                                    keyPath: "id",
                                    autoIncrement: true
                                }
                            );


                        branchStore.createIndex(
                            "name",
                            "name",
                            {
                                unique: true
                            }
                        );
                    }
                };


            request.onsuccess =
                function() {

                    resolve(
                        request.result
                    );
                };


            request.onerror =
                function() {

                    reject(
                        request.error
                    );
                };

        }
    );
}


// ============================================================
// INITIALISIERUNG
// ============================================================

async function initializeDatabase() {

    await openDatabase();


    const existingBranches =
        await getBranches();


    /*
     * Neue Standardbranchen ergänzen,
     * ohne bereits vorhandene individuelle
     * Regeln zu überschreiben.
     */

    const existingNames =
        new Set(
            existingBranches.map(
                branch =>
                    branch.name
                        .trim()
                        .toLowerCase()
            )
        );


    for (
        const branch
        of DEFAULT_BRANCHES
    ) {

        const key =
            branch.name
                .trim()
                .toLowerCase();


        if (
            !existingNames.has(
                key
            )
        ) {

            try {

                await addBranch(
                    branch
                );

            } catch(error) {

                console.warn(
                    "Branche konnte nicht angelegt werden:",
                    branch.name,
                    error
                );
            }
        }
    }
}


// ============================================================
// BRANCHEN
// ============================================================

async function getBranches() {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const request =
                db.transaction(
                    BRANCHES_STORE,
                    "readonly"
                )
                .objectStore(
                    BRANCHES_STORE
                )
                .getAll();


            request.onsuccess =
                function() {

                    const branches =
                        request.result.sort(
                            (a, b) =>
                                a.name.localeCompare(
                                    b.name,
                                    "de"
                                )
                        );


                    resolve(
                        branches
                    );
                };


            request.onerror =
                function() {

                    reject(
                        request.error
                    );
                };

        }
    );
}


async function addBranch(
    branch
) {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const request =
                db.transaction(
                    BRANCHES_STORE,
                    "readwrite"
                )
                .objectStore(
                    BRANCHES_STORE
                )
                .add({

                    name:
                        branch.name.trim(),

                    kgv_gruen:
                        Number(
                            branch.kgv_gruen
                        ),

                    kgv_gelb:
                        Number(
                            branch.kgv_gelb
                        ),

                    kgv_orange:
                        Number(
                            branch.kgv_orange
                        )
                });


            request.onsuccess =
                () =>
                    resolve(
                        request.result
                    );


            request.onerror =
                function() {

                    if (
                        request.error?.name
                        ===
                        "ConstraintError"
                    ) {

                        reject(
                            new Error(
                                "Diese Branche existiert bereits."
                            )
                        );

                    } else {

                        reject(
                            request.error
                        );
                    }
                };

        }
    );
}


async function updateBranch(
    branch
) {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const request =
                db.transaction(
                    BRANCHES_STORE,
                    "readwrite"
                )
                .objectStore(
                    BRANCHES_STORE
                )
                .put({

                    id:
                        Number(
                            branch.id
                        ),

                    name:
                        branch.name.trim(),

                    kgv_gruen:
                        Number(
                            branch.kgv_gruen
                        ),

                    kgv_gelb:
                        Number(
                            branch.kgv_gelb
                        ),

                    kgv_orange:
                        Number(
                            branch.kgv_orange
                        )
                });


            request.onsuccess =
                () =>
                    resolve();


            request.onerror =
                () =>
                    reject(
                        request.error
                    );

        }
    );
}


async function deleteBranch(
    branchId
) {

    const stocks =
        await getStocks();


    const used =
        stocks.some(
            stock =>
                Number(
                    stock.branch_id
                )
                ===
                Number(
                    branchId
                )
        );


    if (used) {

        throw new Error(
            "Diese Branche kann nicht gelöscht werden, weil noch Aktien dieser Branche zugeordnet sind."
        );
    }


    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const request =
                db.transaction(
                    BRANCHES_STORE,
                    "readwrite"
                )
                .objectStore(
                    BRANCHES_STORE
                )
                .delete(
                    Number(
                        branchId
                    )
                );


            request.onsuccess =
                () =>
                    resolve();


            request.onerror =
                () =>
                    reject(
                        request.error
                    );

        }
    );
}


// ============================================================
// AKTIEN
// ============================================================

async function getStocks() {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const request =
                db.transaction(
                    STOCKS_STORE,
                    "readonly"
                )
                .objectStore(
                    STOCKS_STORE
                )
                .getAll();


            request.onsuccess =
                function() {

                    const stocks =
                        request.result.sort(
                            (a, b) =>
                                Number(b.id)
                                -
                                Number(a.id)
                        );


                    resolve(
                        stocks
                    );
                };


            request.onerror =
                () =>
                    reject(
                        request.error
                    );

        }
    );
}


async function getStock(
    stockId
) {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const request =
                db.transaction(
                    STOCKS_STORE,
                    "readonly"
                )
                .objectStore(
                    STOCKS_STORE
                )
                .get(
                    Number(
                        stockId
                    )
                );


            request.onsuccess =
                () =>
                    resolve(
                        request.result ||
                        null
                    );


            request.onerror =
                () =>
                    reject(
                        request.error
                    );

        }
    );
}


async function addStock(
    stock
) {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const request =
                db.transaction(
                    STOCKS_STORE,
                    "readwrite"
                )
                .objectStore(
                    STOCKS_STORE
                )
                .add({

                    name:
                        stock.name.trim(),

                    branch_id:
                        Number(
                            stock.branch_id
                        ),

                    kurs:
                        Number(
                            stock.kurs
                        ),

                    eps_2025:
                        Number(
                            stock.eps_2025
                        ),

                    eps_2026:
                        Number(
                            stock.eps_2026
                        )
                });


            request.onsuccess =
                () =>
                    resolve(
                        request.result
                    );


            request.onerror =
                () =>
                    reject(
                        request.error
                    );

        }
    );
}


async function updateStock(
    stock
) {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const request =
                db.transaction(
                    STOCKS_STORE,
                    "readwrite"
                )
                .objectStore(
                    STOCKS_STORE
                )
                .put({

                    id:
                        Number(
                            stock.id
                        ),

                    name:
                        stock.name.trim(),

                    branch_id:
                        Number(
                            stock.branch_id
                        ),

                    kurs:
                        Number(
                            stock.kurs
                        ),

                    eps_2025:
                        Number(
                            stock.eps_2025
                        ),

                    eps_2026:
                        Number(
                            stock.eps_2026
                        )
                });


            request.onsuccess =
                () =>
                    resolve();


            request.onerror =
                () =>
                    reject(
                        request.error
                    );

        }
    );
}


async function deleteStock(
    stockId
) {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const request =
                db.transaction(
                    STOCKS_STORE,
                    "readwrite"
                )
                .objectStore(
                    STOCKS_STORE
                )
                .delete(
                    Number(
                        stockId
                    )
                );


            request.onsuccess =
                () =>
                    resolve();


            request.onerror =
                () =>
                    reject(
                        request.error
                    );

        }
    );
}


// ============================================================
// BEWERTUNGSLOGIK
// ============================================================

function berechneKgv(
    kurs,
    eps
) {

    if (
        Number(eps) <= 0
    ) {

        return null;
    }


    return (
        Number(kurs)
        /
        Number(eps)
    );
}


function berechneBasisKgv(
    kgv,
    forwardKgv
) {

    if (
        kgv === null ||
        forwardKgv === null
    ) {

        return null;
    }


    return (
        kgv +
        forwardKgv
    ) / 2;
}


function berechneGewinnwachstum(
    epsVorjahr,
    epsFolgejahr
) {

    const alt =
        Number(
            epsVorjahr
        );


    const neu =
        Number(
            epsFolgejahr
        );


    if (
        alt <= 0
    ) {

        return null;
    }


    return (
        neu / alt
    ) - 1;
}


/*
 * Buffett-orientierte Bewertungskennzahl:
 *
 * Basis-KGV / (1 + Gewinnwachstum)
 *
 * Mehr Wachstum -> niedrigere Kennzahl
 * Weniger Wachstum -> höhere Kennzahl
 */

function berechneBewertungskennzahl(
    basisKgv,
    gewinnwachstum
) {

    if (
        basisKgv === null ||
        gewinnwachstum === null
    ) {

        return null;
    }


    const faktor =
        1 +
        gewinnwachstum;


    if (
        faktor <= 0
    ) {

        return null;
    }


    return (
        basisKgv /
        faktor
    );
}


function berechneEntscheidung(
    bewertungskennzahl,
    branch
) {

    if (
        bewertungskennzahl === null
    ) {

        return "Nicht bewertbar";
    }


    if (
        bewertungskennzahl
        <=
        Number(
            branch.kgv_gruen
        )
    ) {

        return "Kauf";
    }


    if (
        bewertungskennzahl
        <=
        Number(
            branch.kgv_gelb
        )
    ) {

        return "Aufbau";
    }


    if (
        bewertungskennzahl
        <=
        Number(
            branch.kgv_orange
        )
    ) {

        return "Beobachten";
    }


    return "Kein Kauf";
}


// ============================================================
// TOP-KAUFKURS
// ============================================================

function berechneTopKaufkurs(
    epsVorjahr,
    epsFolgejahr,
    branch
) {

    const eps25 =
        Number(
            epsVorjahr
        );

    const eps26 =
        Number(
            epsFolgejahr
        );

    const kgvGruen =
        Number(
            branch.kgv_gruen
        );


    if (
        eps25 <= 0
        ||
        eps26 <= 0
        ||
        kgvGruen <= 0
    ) {

        return null;
    }


    return (
        kgvGruen
        *
        (
            2
            *
            eps26
            *
            eps26
        )
        /
        (
            eps25
            +
            eps26
        )
    );
}

// ============================================================
// PROZENTUALER ABSTAND ZUM TOP-KAUFKURS
// ============================================================

function berechneAbstandTopKaufkurs(
    kurs,
    topKaufkurs
) {

    const aktuellerKurs =
        Number(
            kurs
        );


    const zielkurs =
        Number(
            topKaufkurs
        );


    if (
        !Number.isFinite(
            aktuellerKurs
        )
        ||
        !Number.isFinite(
            zielkurs
        )
        ||
        zielkurs <= 0
    ) {

        return null;
    }


    return (
        (
            aktuellerKurs
            -
            zielkurs
        )
        /
        zielkurs
    );
}


// ============================================================
// AKTIE BEWERTEN
// ============================================================

function bewerteAktie(
    stock,
    branch
) {

    const kgv =
        berechneKgv(
            stock.kurs,
            stock.eps_2025
        );


    const forwardKgv =
        berechneKgv(
            stock.kurs,
            stock.eps_2026
        );


    const basisKgv =
        berechneBasisKgv(
            kgv,
            forwardKgv
        );


    const gewinnwachstum =
        berechneGewinnwachstum(
            stock.eps_2025,
            stock.eps_2026
        );


    const bewertungskennzahl =
        berechneBewertungskennzahl(
            basisKgv,
            gewinnwachstum
        );


const topKaufkurs =
    berechneTopKaufkurs(
        stock.eps_2025,
        stock.eps_2026,
        branch
    );

    const abstandTopKaufkurs =
        berechneAbstandTopKaufkurs(
            stock.kurs,
            topKaufkurs
        );


    const entscheidung =
        berechneEntscheidung(
            bewertungskennzahl,
            branch
        );


    return {

        ...stock,

        branche:
            branch.name,

        kgv,

        forwardKgv,

        basisKgv,

        gewinnwachstum,

        bewertungskennzahl,

        topKaufkurs,

        abstandTopKaufkurs,

        entscheidung
    };
}


// ============================================================
// AKTIEN RENDERN / SORTIEREN
// ============================================================

async function renderStocks() {

    const stocks =
        await getStocks();


    const branches =
        await getBranches();


    const branchMap =
        new Map();


    branches.forEach(
        branch => {

            branchMap.set(
                Number(
                    branch.id
                ),
                branch
            );
        }
    );


    const evaluated =
        stocks.map(
            stock => {

                const branch =
                    branchMap.get(
                        Number(
                            stock.branch_id
                        )
                    );


                if (!branch) {

                    return {

                        ...stock,

                        branche:
                            "Unbekannte Branche",

                        basisKgv:
                            null,

                        gewinnwachstum:
                            null,

                        bewertungskennzahl:
                            null,

                        topKaufkurs:
                            null,

                        abstandTopKaufkurs:
                            null,

                        entscheidung:
                            "Nicht bewertbar"
                    };
                }


                return bewerteAktie(
                    stock,
                    branch
                );
            }
        );


    /*
     * Sortierung:
     *
     * Kleinster prozentualer Abstand
     * zum Top-Kaufkurs zuerst.
     *
     * Beispiel:
     *
     * -25 %
     * -15 %
     *  -5 %
     *  +3 %
     * +10 %
     *
     * Aktien unterhalb ihres
     * Top-Kaufkurses stehen damit
     * automatisch ganz oben.
     */

    evaluated.sort(
        function(a, b) {

            const abstandA =
                a.abstandTopKaufkurs !== null
                    ? Number(
                        a.abstandTopKaufkurs
                    )
                    : Infinity;


            const abstandB =
                b.abstandTopKaufkurs !== null
                    ? Number(
                        b.abstandTopKaufkurs
                    )
                    : Infinity;


            return (
                abstandA -
                abstandB
            );
        }
    );


    const container =
        document.getElementById(
            "stocks-container"
        );


    const empty =
        document.getElementById(
            "stocks-empty"
        );


    const count =
        document.getElementById(
            "stock-count"
        );


    count.textContent =
        `${evaluated.length} ${
            evaluated.length === 1
                ? "Wert"
                : "Werte"
        }`;


    if (
        evaluated.length === 0
    ) {

        container.innerHTML = "";

        empty.style.display =
            "block";

        return;
    }


    empty.style.display =
        "none";


    container.innerHTML =
        evaluated
            .map(
                renderStockCard
            )
            .join("");
}


// ============================================================
// AKTIENKARTE
// ============================================================

function renderStockCard(
    stock
) {

    let statusClass =
        "status-nicht";


    if (
        stock.entscheidung === "Kauf"
    ) {

        statusClass =
            "status-kauf";

    } else if (
        stock.entscheidung === "Aufbau"
    ) {

        statusClass =
            "status-aufbau";

    } else if (
        stock.entscheidung === "Beobachten"
    ) {

        statusClass =
            "status-beobachten";

    } else if (
        stock.entscheidung === "Kein Kauf"
    ) {

        statusClass =
            "status-kein-kauf";
    }


    const abstandKlasse =
        stock.abstandTopKaufkurs !== null
        &&
        stock.abstandTopKaufkurs <= 0
            ? "buy-good"
            : "";


    return `
        <div class="stock-card">

            <div class="stock-header">

                <div>

                    <div class="stock-name">
                        ${escapeHtml(
                            stock.name
                        )}
                    </div>

                    <div class="stock-branch">
                        ${escapeHtml(
                            stock.branche
                        )}
                    </div>

                </div>


                <div class="stock-price">
                    ${formatEuro(
                        stock.kurs
                    )}
                </div>

            </div>


            <span class="
                status
                ${statusClass}
            ">

                ${escapeHtml(
                    stock.entscheidung
                )}

            </span>


            <div class="metrics">


                <div class="metric">

                    <div class="metric-label">
                        Bewertungskennzahl
                    </div>

                    <div class="metric-value">

                        ${
                            stock.bewertungskennzahl !== null
                                ? formatNumber(
                                    stock.bewertungskennzahl
                                )
                                : "—"
                        }

                    </div>

                </div>


                <div class="metric">

                    <div class="metric-label">
                        Top-Kaufkurs
                    </div>

                    <div class="metric-value">

                        ${
                            stock.topKaufkurs !== null
                                ? formatEuro(
                                    stock.topKaufkurs
                                )
                                : "—"
                        }

                    </div>

                </div>


                <div class="
                    metric
                    ${abstandKlasse}
                ">

                    <div class="metric-label">
                        Abstand Top-Kaufkurs
                    </div>

                    <div class="metric-value">

                        ${
                            stock.abstandTopKaufkurs !== null
                                ? formatPercent(
                                    stock.abstandTopKaufkurs
                                )
                                : "—"
                        }

                    </div>

                </div>


                <div class="metric">

                    <div class="metric-label">
                        Gewinnwachstum
                    </div>

                    <div class="metric-value">

                        ${
                            stock.gewinnwachstum !== null
                                ? formatPercent(
                                    stock.gewinnwachstum
                                )
                                : "—"
                        }

                    </div>

                </div>


                <div class="metric">

                    <div class="metric-label">
                        Basis-KGV
                    </div>

                    <div class="metric-value">

                        ${
                            stock.basisKgv !== null
                                ? formatNumber(
                                    stock.basisKgv
                                )
                                : "—"
                        }

                    </div>

                </div>

            </div>


            <button
                class="secondary"
                type="button"
                style="
                    margin-top:12px;
                "
                data-action="edit-stock"
                data-id="${Number(
                    stock.id
                )}"
            >
                Aktie bearbeiten
            </button>

        </div>
    `;
}


// ============================================================
// AKTIENFORMULAR
// ============================================================

function openNewStockForm() {

    editingStockId =
        null;


    document.getElementById(
        "stock-form"
    ).reset();


    document.getElementById(
        "stock-form-title"
    ).textContent =
        "Neue Aktie";


    document.getElementById(
        "delete-stock-button"
    ).style.display =
        "none";


    document.getElementById(
        "stock-form-card"
    ).classList.add(
        "active"
    );
}


function closeStockForm() {

    document.getElementById(
        "stock-form"
    ).reset();


    document.getElementById(
        "stock-form-card"
    ).classList.remove(
        "active"
    );


    document.getElementById(
        "stock-form-title"
    ).textContent =
        "Neue Aktie";


    document.getElementById(
        "delete-stock-button"
    ).style.display =
        "none";


    editingStockId =
        null;
}


// ============================================================
// AKTIE BEARBEITEN
// ============================================================

async function editStock(
    stockId
) {

    try {

        const stock =
            await getStock(
                Number(
                    stockId
                )
            );


        if (!stock) {

            throw new Error(
                "Aktie wurde in der lokalen Datenbank nicht gefunden."
            );
        }


        await loadBranchSelect();


        editingStockId =
            Number(
                stock.id
            );


        document.getElementById(
            "stock-form-title"
        ).textContent =
            "Aktie bearbeiten";


        document.getElementById(
            "stock-name"
        ).value =
            stock.name;


        document.getElementById(
            "stock-branch"
        ).value =
            String(
                stock.branch_id
            );


        document.getElementById(
            "stock-kurs"
        ).value =
            formatInput(
                stock.kurs
            );


        document.getElementById(
            "stock-eps-2025"
        ).value =
            formatInput(
                stock.eps_2025
            );


        document.getElementById(
            "stock-eps-2026"
        ).value =
            formatInput(
                stock.eps_2026
            );


        document.getElementById(
            "delete-stock-button"
        ).style.display =
            "block";


        document.getElementById(
            "stock-form-card"
        ).classList.add(
            "active"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch(error) {

        console.error(
            "Fehler beim Bearbeiten:",
            error
        );


        alert(
            error.message
        );
    }
}


// ============================================================
// AKTIE SPEICHERN
// ============================================================

async function saveStock(
    event
) {

    event.preventDefault();


    try {

        const name =
            document.getElementById(
                "stock-name"
            ).value.trim();


        const branchId =
            Number(
                document.getElementById(
                    "stock-branch"
                ).value
            );


        const kurs =
            parseNumber(
                document.getElementById(
                    "stock-kurs"
                ).value
            );


        const eps2025 =
            parseNumber(
                document.getElementById(
                    "stock-eps-2025"
                ).value
            );


        const eps2026 =
            parseNumber(
                document.getElementById(
                    "stock-eps-2026"
                ).value
            );


        if (!name) {

            throw new Error(
                "Bitte einen Aktiennamen eingeben."
            );
        }


        if (!branchId) {

            throw new Error(
                "Bitte eine Branche auswählen."
            );
        }


        if (
            kurs === null ||
            eps2025 === null ||
            eps2026 === null
        ) {

            throw new Error(
                "Kurs und EPS müssen gültige Zahlen sein."
            );
        }


        const stock = {

            name,

            branch_id:
                branchId,

            kurs,

            eps_2025:
                eps2025,

            eps_2026:
                eps2026
        };


        if (
            editingStockId === null
        ) {

            await addStock(
                stock
            );

        } else {

            stock.id =
                editingStockId;

            await updateStock(
                stock
            );
        }


        closeStockForm();

        await renderStocks();


    } catch(error) {

        console.error(
            "Fehler beim Speichern:",
            error
        );


        alert(
            "Speichern fehlgeschlagen:\n\n"
            +
            error.message
        );
    }
}


// ============================================================
// AKTIE LÖSCHEN
// ============================================================

async function removeCurrentStock() {

    if (
        editingStockId === null
    ) {

        return;
    }


    const stock =
        await getStock(
            editingStockId
        );


    if (!stock) {

        return;
    }


    if (
        !window.confirm(
            `Soll ${stock.name} wirklich gelöscht werden?`
        )
    ) {

        return;
    }


    try {

        await deleteStock(
            editingStockId
        );


        closeStockForm();

        await renderStocks();


    } catch(error) {

        alert(
            "Die Aktie konnte nicht gelöscht werden.\n\n"
            +
            error.message
        );
    }
}


// ============================================================
// BRANCHENAUSWAHL
// ============================================================

async function loadBranchSelect() {

    const select =
        document.getElementById(
            "stock-branch"
        );


    const branches =
        await getBranches();


    select.innerHTML = `
        <option value="">
            Bitte auswählen
        </option>
    `;


    branches.forEach(
        branch => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(
                    branch.id
                );


            option.textContent =
                branch.name;


            select.appendChild(
                option
            );
        }
    );
}


// ============================================================
// REGELN
// ============================================================

async function renderRules() {

    const container =
        document.getElementById(
            "branches-container"
        );


    const branches =
        await getBranches();


    container.innerHTML =
        branches
            .map(
                renderRuleCard
            )
            .join("");
}


function renderRuleCard(
    branch
) {

    return `
        <div
            class="card"
            data-branch-id="${Number(
                branch.id
            )}"
        >

            <div class="rule-grid">

                <div
                    class="
                        field
                        rule-name
                    "
                >

                    <label>
                        Branche
                    </label>

                    <input
                        data-field="name"
                        value="${escapeHtml(
                            branch.name
                        )}"
                    >

                </div>


                <div class="field">

                    <label>
                        KGV Grün
                    </label>

                    <input
                        data-field="kgv_gruen"
                        inputmode="decimal"
                        value="${formatInput(
                            branch.kgv_gruen
                        )}"
                    >

                </div>


                <div class="field">

                    <label>
                        KGV Gelb
                    </label>

                    <input
                        data-field="kgv_gelb"
                        inputmode="decimal"
                        value="${formatInput(
                            branch.kgv_gelb
                        )}"
                    >

                </div>


                <div class="field">

                    <label>
                        KGV Orange
                    </label>

                    <input
                        data-field="kgv_orange"
                        inputmode="decimal"
                        value="${formatInput(
                            branch.kgv_orange
                        )}"
                    >

                </div>

            </div>


            <div class="rule-actions">

                <button
                    class="primary"
                    type="button"
                    data-action="save-branch"
                    data-id="${Number(
                        branch.id
                    )}"
                >
                    Bewertungsregeln speichern
                </button>


                <button
                    class="danger"
                    type="button"
                    data-action="delete-branch"
                    data-id="${Number(
                        branch.id
                    )}"
                >
                    Branche löschen
                </button>

            </div>

        </div>
    `;
}


async function saveBranch(
    branchId
) {

    const card =
        document.querySelector(
            `[data-branch-id="${branchId}"]`
        );


    if (!card) {

        throw new Error(
            "Branche wurde nicht gefunden."
        );
    }


    const get =
        field =>
            card
                .querySelector(
                    `[data-field="${field}"]`
                )
                .value;


    const name =
        get(
            "name"
        ).trim();


    const kgvGruen =
        parseNumber(
            get(
                "kgv_gruen"
            )
        );


    const kgvGelb =
        parseNumber(
            get(
                "kgv_gelb"
            )
        );


    const kgvOrange =
        parseNumber(
            get(
                "kgv_orange"
            )
        );


    validateBranch(
        name,
        kgvGruen,
        kgvGelb,
        kgvOrange
    );


    await updateBranch({

        id:
            branchId,

        name,

        kgv_gruen:
            kgvGruen,

        kgv_gelb:
            kgvGelb,

        kgv_orange:
            kgvOrange
    });


    await renderRules();

    await loadBranchSelect();

    await renderStocks();


    alert(
        "Bewertungsregeln gespeichert."
    );
}


async function createBranch(
    event
) {

    event.preventDefault();


    try {

        const name =
            document.getElementById(
                "new-branch-name"
            ).value.trim();


        const kgvGruen =
            parseNumber(
                document.getElementById(
                    "new-kgv-green"
                ).value
            );


        const kgvGelb =
            parseNumber(
                document.getElementById(
                    "new-kgv-yellow"
                ).value
            );


        const kgvOrange =
            parseNumber(
                document.getElementById(
                    "new-kgv-orange"
                ).value
            );


        validateBranch(
            name,
            kgvGruen,
            kgvGelb,
            kgvOrange
        );


        await addBranch({

            name,

            kgv_gruen:
                kgvGruen,

            kgv_gelb:
                kgvGelb,

            kgv_orange:
                kgvOrange

        });


        event.target.reset();


        await renderRules();

        await loadBranchSelect();


        alert(
            "Branche hinzugefügt."
        );


    } catch(error) {

        alert(
            error.message
        );
    }
}


async function removeBranch(
    branchId
) {

    const branches =
        await getBranches();


    const branch =
        branches.find(
            item =>
                Number(item.id)
                ===
                Number(branchId)
        );


    if (!branch) {

        return;
    }


    if (
        !window.confirm(
            `Soll die Branche "${branch.name}" wirklich gelöscht werden?`
        )
    ) {

        return;
    }


    try {

        await deleteBranch(
            branchId
        );


        await renderRules();

        await loadBranchSelect();


    } catch(error) {

        alert(
            error.message
        );
    }
}


// ============================================================
// BRANCHEN VALIDIEREN
// ============================================================

function validateBranch(
    name,
    kgvGruen,
    kgvGelb,
    kgvOrange
) {

    if (!name) {

        throw new Error(
            "Bitte einen Branchennamen eingeben."
        );
    }


    if (
        kgvGruen === null ||
        kgvGelb === null ||
        kgvOrange === null
    ) {

        throw new Error(
            "Bitte alle KGV-Grenzen eingeben."
        );
    }


    if (
        !(
            kgvGruen
            <
            kgvGelb
            &&
            kgvGelb
            <
            kgvOrange
        )
    ) {

        throw new Error(
            "KGV muss aufsteigend sein: Grün < Gelb < Orange."
        );
    }
}


// ============================================================
// NAVIGATION
// ============================================================

function showStocks() {

    document.getElementById(
        "stocks-view"
    ).classList.add(
        "active"
    );


    document.getElementById(
        "rules-view"
    ).classList.remove(
        "active"
    );


    document.getElementById(
        "nav-stocks"
    ).classList.add(
        "active"
    );


    document.getElementById(
        "nav-rules"
    ).classList.remove(
        "active"
    );


    renderStocks();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showRules() {

    document.getElementById(
        "stocks-view"
    ).classList.remove(
        "active"
    );


    document.getElementById(
        "rules-view"
    ).classList.add(
        "active"
    );


    document.getElementById(
        "nav-stocks"
    ).classList.remove(
        "active"
    );


    document.getElementById(
        "nav-rules"
    ).classList.add(
        "active"
    );


    renderRules();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ============================================================
// HILFSFUNKTIONEN
// ============================================================

function parseNumber(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return null;
    }


    let text =
        String(
            value
        ).trim();


    if (!text) {

        return null;
    }


    if (
        text.includes(",")
    ) {

        text =
            text.replace(
                /\./g,
                ""
            );


        text =
            text.replace(
                ",",
                "."
            );
    }


    const number =
        Number(
            text
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return null;
    }


    return number;
}


function formatInput(
    value
) {

    return Number(
        value
    ).toLocaleString(
        "de-DE",
        {
            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2
        }
    );
}


function formatNumber(
    value,
    decimals = 2
) {

    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(
            Number(value)
        )
    ) {

        return "—";
    }


    return Number(
        value
    ).toLocaleString(
        "de-DE",
        {
            minimumFractionDigits:
                decimals,

            maximumFractionDigits:
                decimals
        }
    );
}


function formatEuro(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "—";
    }


    return (
        formatNumber(
            value,
            2
        )
        +
        " €"
    );
}


function formatPercent(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "—";
    }


    return (
        formatNumber(
            value * 100,
            1
        )
        +
        " %"
    );
}


function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;
}


// ============================================================
// EVENT DELEGATION
// ============================================================

document.addEventListener(
    "click",
    async function(event) {

        const target =
            event.target.closest(
                "[data-action]"
            );


        if (!target) {

            return;
        }


        try {

            const action =
                target.dataset.action;


            if (
                action ===
                "edit-stock"
            ) {

                await editStock(
                    target.dataset.id
                );


                return;
            }


            if (
                action ===
                "save-branch"
            ) {

                await saveBranch(
                    target.dataset.id
                );


                return;
            }


            if (
                action ===
                "delete-branch"
            ) {

                await removeBranch(
                    target.dataset.id
                );
            }


        } catch(error) {

            console.error(
                error
            );


            alert(
                error.message
            );
        }

    }
);


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        try {

            await initializeDatabase();

            await loadBranchSelect();

            await renderStocks();


            document
                .getElementById(
                    "add-stock-button"
                )
                .addEventListener(
                    "click",
                    openNewStockForm
                );


            document
                .getElementById(
                    "stock-form"
                )
                .addEventListener(
                    "submit",
                    saveStock
                );


            document
                .getElementById(
                    "delete-stock-button"
                )
                .addEventListener(
                    "click",
                    removeCurrentStock
                );


            document
                .getElementById(
                    "cancel-stock-button"
                )
                .addEventListener(
                    "click",
                    closeStockForm
                );


            document
                .getElementById(
                    "rules-top-button"
                )
                .addEventListener(
                    "click",
                    showRules
                );


            document
                .getElementById(
                    "rules-back-button"
                )
                .addEventListener(
                    "click",
                    showStocks
                );


            document
                .getElementById(
                    "nav-stocks"
                )
                .addEventListener(
                    "click",
                    showStocks
                );


            document
                .getElementById(
                    "nav-rules"
                )
                .addEventListener(
                    "click",
                    showRules
                );


            document
                .getElementById(
                    "new-branch-form"
                )
                .addEventListener(
                    "submit",
                    createBranch
                );


        } catch(error) {

            console.error(
                "STARTFEHLER:",
                error
            );


            alert(
                "Die Anwendung konnte nicht gestartet werden.\n\n"
                +
                error.message
            );
        }

    }
);