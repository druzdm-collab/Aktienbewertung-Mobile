// ============================================================
// AKTIENBEWERTUNG - KOMPLETT LOKAL
// Eine Datei: Datenbank + Logik + Oberfläche
// Keine MK/JD-Logik
// Keine externen JS-Dateien
// ============================================================


"use strict";


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
        name: "Industrie",
        kgv_gruen: 14,
        kgv_gelb: 18,
        kgv_orange: 22,
        peg_gruen: 1.30,
        peg_gelb: 1.80,
        peg_orange: 2.20
    },

    {
        name: "Finanzen",
        kgv_gruen: 12,
        kgv_gelb: 15,
        kgv_orange: 18,
        peg_gruen: 1.20,
        peg_gelb: 1.70,
        peg_orange: 2.00
    },

    {
        name: "Versicherung",
        kgv_gruen: 12,
        kgv_gelb: 15,
        kgv_orange: 18,
        peg_gruen: 1.20,
        peg_gelb: 1.70,
        peg_orange: 2.00
    },

    {
        name: "Rüstung",
        kgv_gruen: 18,
        kgv_gelb: 24,
        kgv_orange: 30,
        peg_gruen: 1.50,
        peg_gelb: 2.00,
        peg_orange: 2.50
    },

    {
        name: "Automobil",
        kgv_gruen: 9,
        kgv_gelb: 12,
        kgv_orange: 15,
        peg_gruen: 1.00,
        peg_gelb: 1.50,
        peg_orange: 2.00
    },

    {
        name: "IT + Software",
        kgv_gruen: 24,
        kgv_gelb: 30,
        kgv_orange: 35,
        peg_gruen: 1.50,
        peg_gelb: 2.00,
        peg_orange: 2.50
    },

    {
        name: "Energie",
        kgv_gruen: 10,
        kgv_gelb: 14,
        kgv_orange: 18,
        peg_gruen: 1.00,
        peg_gelb: 1.50,
        peg_orange: 2.00
    },

    {
        name: "Konsum",
        kgv_gruen: 19,
        kgv_gelb: 24,
        kgv_orange: 28,
        peg_gruen: 1.30,
        peg_gelb: 1.80,
        peg_orange: 2.20
    },

    {
        name: "Logistik",
        kgv_gruen: 14,
        kgv_gelb: 18,
        kgv_orange: 22,
        peg_gruen: 1.20,
        peg_gelb: 1.70,
        peg_orange: 2.10
    },

    {
        name: "Halbleiter",
        kgv_gruen: 18,
        kgv_gelb: 24,
        kgv_orange: 30,
        peg_gruen: 1.30,
        peg_gelb: 1.80,
        peg_orange: 2.30
    },

    {
        name: "Pharma",
        kgv_gruen: 14,
        kgv_gelb: 18,
        kgv_orange: 22,
        peg_gruen: 1.20,
        peg_gelb: 1.70,
        peg_orange: 2.10
    },

    {
        name: "Medizintechnik",
        kgv_gruen: 20,
        kgv_gelb: 25,
        kgv_orange: 30,
        peg_gruen: 1.40,
        peg_gelb: 1.90,
        peg_orange: 2.30
    },

    {
        name: "Telekommunikation",
        kgv_gruen: 11,
        kgv_gelb: 15,
        kgv_orange: 18,
        peg_gruen: 1.10,
        peg_gelb: 1.60,
        peg_orange: 2.00
    },

    {
        name: "Chemie",
        kgv_gruen: 12,
        kgv_gelb: 16,
        kgv_orange: 20,
        peg_gruen: 1.20,
        peg_gelb: 1.70,
        peg_orange: 2.10
    },

    {
        name: "Medien / Unterhaltung",
        kgv_gruen: 15,
        kgv_gelb: 20,
        kgv_orange: 25,
        peg_gruen: 1.30,
        peg_gelb: 1.80,
        peg_orange: 2.20
    },

    {
        name: "Börsen / Finanzinfrastruktur",
        kgv_gruen: 20,
        kgv_gelb: 25,
        kgv_orange: 30,
        peg_gruen: 1.50,
        peg_gelb: 2.00,
        peg_orange: 2.50
    },

    {
        name: "Zahlungsdienstleister",
        kgv_gruen: 20,
        kgv_gelb: 27,
        kgv_orange: 32,
        peg_gruen: 1.50,
        peg_gelb: 2.00,
        peg_orange: 2.50
    },

    {
        name: "Luxus",
        kgv_gruen: 20,
        kgv_gelb: 25,
        kgv_orange: 30,
        peg_gruen: 1.50,
        peg_gelb: 2.00,
        peg_orange: 2.50
    },

    {
        name: "Einzelhandel",
        kgv_gruen: 12,
        kgv_gelb: 16,
        kgv_orange: 20,
        peg_gruen: 1.10,
        peg_gelb: 1.60,
        peg_orange: 2.00
    },

    {
        name: "Getränke / Marken-Konsum",
        kgv_gruen: 18,
        kgv_gelb: 23,
        kgv_orange: 28,
        peg_gruen: 1.40,
        peg_gelb: 1.90,
        peg_orange: 2.30
    },

    {
        name: "Versorger",
        kgv_gruen: 10,
        kgv_gelb: 14,
        kgv_orange: 17,
        peg_gruen: 1.00,
        peg_gelb: 1.50,
        peg_orange: 2.00
    },

    {
        name: "Wachstumsunternehmen",
        kgv_gruen: 24,
        kgv_gelb: 30,
        kgv_orange: 35,
        peg_gruen: 1.50,
        peg_gelb: 2.00,
        peg_orange: 2.50
    }

];


// ============================================================
// DATABASE
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
                        !db.objectStoreNames
                            .contains(
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
                        !db.objectStoreNames
                            .contains(
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
// BRANCHEN
// ============================================================

async function getBranches() {

    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    BRANCHES_STORE,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    BRANCHES_STORE
                );


            const request =
                store.getAll();


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

            const transaction =
                db.transaction(
                    BRANCHES_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    BRANCHES_STORE
                );


            const request =
                store.add({

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
                        ),

                    peg_gruen:
                        Number(
                            branch.peg_gruen
                        ),

                    peg_gelb:
                        Number(
                            branch.peg_gelb
                        ),

                    peg_orange:
                        Number(
                            branch.peg_orange
                        )
                });


            request.onsuccess =
                () => resolve(
                    request.result
                );


            request.onerror =
                () => {

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

            const transaction =
                db.transaction(
                    BRANCHES_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    BRANCHES_STORE
                );


            const request =
                store.put({

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
                        ),

                    peg_gruen:
                        Number(
                            branch.peg_gruen
                        ),

                    peg_gelb:
                        Number(
                            branch.peg_gelb
                        ),

                    peg_orange:
                        Number(
                            branch.peg_orange
                        )
                });


            request.onsuccess =
                () => resolve();


            request.onerror =
                () => reject(
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

            const transaction =
                db.transaction(
                    BRANCHES_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    BRANCHES_STORE
                );


            const request =
                store.delete(
                    Number(
                        branchId
                    )
                );


            request.onsuccess =
                () => resolve();


            request.onerror =
                () => reject(
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

            const transaction =
                db.transaction(
                    STOCKS_STORE,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    STOCKS_STORE
                );


            const request =
                store.getAll();


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
                () => reject(
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

            const transaction =
                db.transaction(
                    STOCKS_STORE,
                    "readonly"
                );


            const request =
                transaction
                    .objectStore(
                        STOCKS_STORE
                    )
                    .get(
                        Number(
                            stockId
                        )
                    );


            request.onsuccess =
                () => resolve(
                    request.result || null
                );


            request.onerror =
                () => reject(
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

            const transaction =
                db.transaction(
                    STOCKS_STORE,
                    "readwrite"
                );


            const request =
                transaction
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
                () => resolve(
                    request.result
                );


            request.onerror =
                () => reject(
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

            const transaction =
                db.transaction(
                    STOCKS_STORE,
                    "readwrite"
                );


            const request =
                transaction
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
                () => resolve();


            request.onerror =
                () => reject(
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

            const transaction =
                db.transaction(
                    STOCKS_STORE,
                    "readwrite"
                );


            const request =
                transaction
                    .objectStore(
                        STOCKS_STORE
                    )
                    .delete(
                        Number(
                            stockId
                        )
                    );


            request.onsuccess =
                () => resolve();


            request.onerror =
                () => reject(
                    request.error
                );

        }
    );
}


// ============================================================
// BEWERTUNG
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


    return Number(kurs)
        /
        Number(eps);
}


function berechneBewertungsKgv(
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


function berechneTopKaufkurs(
    epsFolgejahr,
    kgvGruen
) {

    if (
        Number(epsFolgejahr) <= 0
    ) {

        return null;
    }


    return (
        Number(epsFolgejahr)
        *
        Number(kgvGruen)
    );
}


function berechneGewinnwachstum(
    epsVorjahr,
    epsFolgejahr
) {

    if (
        Number(epsVorjahr) <= 0
    ) {

        return null;
    }


    return (
        Number(epsFolgejahr)
        /
        Number(epsVorjahr)
    ) - 1;
}


function berechnePeg(
    bewertungsKgv,
    gewinnwachstum
) {

    if (
        bewertungsKgv === null ||
        gewinnwachstum === null ||
        gewinnwachstum <= 0
    ) {

        return null;
    }


    return (
        bewertungsKgv
        /
        (
            gewinnwachstum
            *
            100
        )
    );
}


function berechneKgvScore(
    bewertungsKgv,
    branch
) {

    if (
        bewertungsKgv === null
    ) {

        return null;
    }


    if (
        bewertungsKgv
        <=
        Number(
            branch.kgv_gruen
        )
    ) {

        return 4;
    }


    if (
        bewertungsKgv
        <=
        Number(
            branch.kgv_gelb
        )
    ) {

        return 3;
    }


    if (
        bewertungsKgv
        <=
        Number(
            branch.kgv_orange
        )
    ) {

        return 2;
    }


    return 1;
}


function berechnePegScore(
    peg,
    branch
) {

    if (
        peg === null
    ) {

        return 0;
    }


    if (
        peg
        <=
        Number(
            branch.peg_gruen
        )
    ) {

        return 4;
    }


    if (
        peg
        <=
        Number(
            branch.peg_gelb
        )
    ) {

        return 3;
    }


    if (
        peg
        <=
        Number(
            branch.peg_orange
        )
    ) {

        return 2;
    }


    return 1;
}


function berechneGesamtscore(
    kgvScore,
    pegScore
) {

    if (
        kgvScore === null
    ) {

        return null;
    }


    return (
        kgvScore * 0.60
        +
        pegScore * 0.40
    );
}


function berechneEntscheidung(
    score
) {

    if (
        score === null
    ) {

        return "Nicht bewertbar";
    }


    if (
        score >= 3.25
    ) {

        return "Kauf";
    }


    if (
        score >= 2.25
    ) {

        return "Aufbau";
    }


    return "Kein Kauf";
}


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


    const bewertungsKgv =
        berechneBewertungsKgv(
            kgv,
            forwardKgv
        );


    const topKaufkurs =
        berechneTopKaufkurs(
            stock.eps_2026,
            branch.kgv_gruen
        );


    const gewinnwachstum =
        berechneGewinnwachstum(
            stock.eps_2025,
            stock.eps_2026
        );


    const peg =
        berechnePeg(
            bewertungsKgv,
            gewinnwachstum
        );


    const kgvScore =
        berechneKgvScore(
            bewertungsKgv,
            branch
        );


    const pegScore =
        berechnePegScore(
            peg,
            branch
        );


    const gesamtscore =
        berechneGesamtscore(
            kgvScore,
            pegScore
        );


    return {

        ...stock,

        branche:
            branch.name,

        kgv,

        forwardKgv,

        bewertungsKgv,

        topKaufkurs,

        gewinnwachstum,

        peg,

        kgvScore,

        pegScore,

        gesamtscore,

        entscheidung:
            berechneEntscheidung(
                gesamtscore
            )
    };
}


// ============================================================
// AKTIEN RENDERN
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

                        bewertungsKgv:
                            null,

                        topKaufkurs:
                            null,

                        gewinnwachstum:
                            null,

                        peg:
                            null,

                        kgvScore:
                            null,

                        pegScore:
                            0,

                        gesamtscore:
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


    evaluated.sort(
        (a,b) =>
            (
                b.gesamtscore ?? -1
            )
            -
            (
                a.gesamtscore ?? -1
            )
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


function renderStockCard(
    stock
) {

    const status =
        stock.entscheidung;


    const statusClassName =
        status === "Kauf"
            ? "status-kauf"
            : status === "Aufbau"
                ? "status-aufbau"
                : status === "Kein Kauf"
                    ? "status-kein-kauf"
                    : "status-nicht";


    const kgvClass =
        scoreCss(
            stock.kgvScore
        );


    const pegClass =
        scoreCss(
            stock.pegScore
        );


    const topGood =
        stock.topKaufkurs !== null
        &&
        Number(stock.kurs)
            <=
            Number(stock.topKaufkurs)
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
                ${statusClassName}
            ">
                ${escapeHtml(
                    status
                )}
            </span>


            <div class="metrics">

                <div class="
                    metric
                    ${kgvClass}
                ">

                    <div class="metric-label">
                        Bewertungs-KGV
                    </div>

                    <div class="metric-value">
                        ${
                            stock.bewertungsKgv !== null
                                ? formatNumber(
                                    stock.bewertungsKgv
                                )
                                : "—"
                        }
                    </div>

                </div>


                <div class="
                    metric
                    ${topGood}
                ">

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


                <div class="
                    metric
                    ${pegClass}
                ">

                    <div class="metric-label">
                        PEG
                    </div>

                    <div class="metric-value">
                        ${
                            stock.peg !== null
                                ? formatNumber(
                                    stock.peg
                                )
                                : "—"
                        }
                    </div>

                </div>

            </div>


            <div class="score-summary">

                <div>

                    <div class="score-description">
                        Gesamtscore
                    </div>

                    <div class="score-big">
                        ${
                            stock.gesamtscore !== null
                                ? formatNumber(
                                    stock.gesamtscore
                                )
                                : "—"
                        }
                    </div>

                </div>


                <div style="text-align:right;">

                    <div class="score-description">
                        KGV / PEG
                    </div>

                    <strong>
                        ${
                            stock.kgvScore !== null
                                ? stock.kgvScore
                                : "—"
                        }
                        /
                        ${
                            stock.pegScore
                        }
                    </strong>

                </div>

            </div>


            <button
                class="secondary"
                type="button"
                style="margin-top:12px;"
                data-action="edit-stock"
                data-id="${Number(stock.id)}"
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
// AKTIEN SPEICHERN
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
            "Speichern fehlgeschlagen:\n\n" +
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

        alert(
            "Aktie wurde nicht gefunden."
        );

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
            "Die Aktie konnte nicht gelöscht werden.\n\n" +
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
                    class="field rule-name"
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


                <div class="field">

                    <label>
                        PEG Grün
                    </label>

                    <input
                        data-field="peg_gruen"
                        inputmode="decimal"
                        value="${formatInput(
                            branch.peg_gruen
                        )}"
                    >

                </div>


                <div class="field">

                    <label>
                        PEG Gelb
                    </label>

                    <input
                        data-field="peg_gelb"
                        inputmode="decimal"
                        value="${formatInput(
                            branch.peg_gelb
                        )}"
                    >

                </div>


                <div class="field">

                    <label>
                        PEG Orange
                    </label>

                    <input
                        data-field="peg_orange"
                        inputmode="decimal"
                        value="${formatInput(
                            branch.peg_orange
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
        get("name").trim();


    const kgvGruen =
        parseNumber(
            get("kgv_gruen")
        );


    const kgvGelb =
        parseNumber(
            get("kgv_gelb")
        );


    const kgvOrange =
        parseNumber(
            get("kgv_orange")
        );


    const pegGruen =
        parseNumber(
            get("peg_gruen")
        );


    const pegGelb =
        parseNumber(
            get("peg_gelb")
        );


    const pegOrange =
        parseNumber(
            get("peg_orange")
        );


    validateBranch(
        name,
        kgvGruen,
        kgvGelb,
        kgvOrange,
        pegGruen,
        pegGelb,
        pegOrange
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
            kgvOrange,

        peg_gruen:
            pegGruen,

        peg_gelb:
            pegGelb,

        peg_orange:
            pegOrange
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


        const pegGruen =
            parseNumber(
                document.getElementById(
                    "new-peg-green"
                ).value
            );


        const pegGelb =
            parseNumber(
                document.getElementById(
                    "new-peg-yellow"
                ).value
            );


        const pegOrange =
            parseNumber(
                document.getElementById(
                    "new-peg-orange"
                ).value
            );


        validateBranch(
            name,
            kgvGruen,
            kgvGelb,
            kgvOrange,
            pegGruen,
            pegGelb,
            pegOrange
        );


        await addBranch({

            name,

            kgv_gruen:
                kgvGruen,

            kgv_gelb:
                kgvGelb,

            kgv_orange:
                kgvOrange,

            peg_gruen:
                pegGruen,

            peg_gelb:
                pegGelb,

            peg_orange:
                pegOrange
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


function validateBranch(
    name,
    kgvGruen,
    kgvGelb,
    kgvOrange,
    pegGruen,
    pegGelb,
    pegOrange
) {

    if (!name) {

        throw new Error(
            "Bitte einen Branchennamen eingeben."
        );
    }


    if (
        kgvGruen === null ||
        kgvGelb === null ||
        kgvOrange === null ||
        pegGruen === null ||
        pegGelb === null ||
        pegOrange === null
    ) {

        throw new Error(
            "Bitte alle Bewertungswerte eingeben."
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


    if (
        !(
            pegGruen
            <
            pegGelb
            &&
            pegGelb
            <
            pegOrange
        )
    ) {

        throw new Error(
            "PEG muss aufsteigend sein: Grün < Gelb < Orange."
        );
    }
}


// ============================================================
// ANSICHTEN
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


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );
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


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );
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
        String(value).trim();


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
        Number(text);


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
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
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


function scoreCss(
    score
) {

    if (score === 4) {
        return "score-4";
    }

    if (score === 3) {
        return "score-3";
    }

    if (score === 2) {
        return "score-2";
    }

    if (score === 1) {
        return "score-1";
    }

    return "score-0";
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
// EVENT-DELEGATION FÜR DYNAMISCHE BUTTONS
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


        const action =
            target.dataset.action;


        try {

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

            // Datenbank öffnen
            await openDatabase();


            // Standardbranchen einmalig anlegen
            const branches =
                await getBranches();


            if (
                branches.length === 0
            ) {

                for (
                    const branch
                    of DEFAULT_BRANCHES
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


            // Branchen laden
            await loadBranchSelect();


            // Aktien anzeigen
            await renderStocks();


            // Aktien hinzufügen
            document
                .getElementById(
                    "add-stock-button"
                )
                .addEventListener(
                    "click",
                    openNewStockForm
                );


            // Aktien speichern
            document
                .getElementById(
                    "stock-form"
                )
                .addEventListener(
                    "submit",
                    saveStock
                );


            // Aktien löschen
            document
                .getElementById(
                    "delete-stock-button"
                )
                .addEventListener(
                    "click",
                    removeCurrentStock
                );


            // Formular abbrechen
            document
                .getElementById(
                    "cancel-stock-button"
                )
                .addEventListener(
                    "click",
                    closeStockForm
                );


            // Regeln oben
            document
                .getElementById(
                    "rules-top-button"
                )
                .addEventListener(
                    "click",
                    showRules
                );


            // Regeln zurück
            document
                .getElementById(
                    "rules-back-button"
                )
                .addEventListener(
                    "click",
                    showStocks
                );


            // Navigation unten
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