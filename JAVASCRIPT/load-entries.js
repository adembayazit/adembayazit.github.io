// ================= GLOBAL =================

const likesCache = {
  data: {},
  lastUpdated: 0,
  isUpdating: false
};

const pinsCache = {
  data: {},
  lastUpdated: 0,
  isUpdating: false
};

let allEntries = [];
let groupedEntries = [];

let refreshInterval = 30000;
let checkInterval;
let lastEntryCount = 0;


// ================= BIN SYSTEM =================

const MASTER_BIN_ID = "68933248ae596e708fc2fbbc";
let currentActiveBinId = MASTER_BIN_ID;
let allBins = [];


// ================= JSONBIN NORMALIZER =================

function normalizeBin(data) {
  return data?.record ?? data ?? {};
}


// ================= PROXY FETCH =================

async function fetchViaProxy(path, method = "GET", body = null, binId = null) {

  const proxyUrl = "https://adembayazit.netlify.app/.netlify/functions/jsonbin-proxy";

  const actualPath = binId
    ? `/b/${binId}${path}`
    : path;

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      path: actualPath,
      method,
      body
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const json = await response.json();
  return normalizeBin(json);
}


// ================= BIN INIT =================

async function initializeBinSystem() {

  try {

    const masterData = await fetchViaProxy("/latest", "GET", null, MASTER_BIN_ID);

    if (masterData?.bins?.length) {

      allBins = masterData.bins;
      currentActiveBinId = masterData.activeBin || MASTER_BIN_ID;

    } else {

      allBins = [{
        id: MASTER_BIN_ID,
        createdAt: new Date().toISOString(),
        isMaster: true
      }];

      currentActiveBinId = MASTER_BIN_ID;

    }

    console.log("Bin system initialized:", allBins);

  } catch (error) {

    console.error("Bin init failed:", error);

    allBins = [{
      id: MASTER_BIN_ID,
      createdAt: new Date().toISOString(),
      isMaster: true
    }];

    currentActiveBinId = MASTER_BIN_ID;

  }

}


// ================= LOAD ALL ENTRIES =================

async function loadAllEntries() {

  let entries = [];

  const sortedBins = [...allBins]
    .filter(b => !b.isMaster)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  console.log(`Loading entries from ${sortedBins.length} bins...`);

  for (const bin of sortedBins) {

    try {

      const binData = await fetchViaProxy("/latest", "GET", null, bin.id);

      if (Array.isArray(binData.records)) {
        entries.push(...binData.records);
      }

    } catch (error) {
      console.error(`Bin load error ${bin.id}`, error);
    }

  }

  if (entries.length === 0) {

    console.log("No bins found, loading master bin...");

    try {

      const masterData = await fetchViaProxy("/latest", "GET", null, MASTER_BIN_ID);

      if (Array.isArray(masterData.records)) {
        entries = masterData.records;
      }

    } catch (error) {
      console.error("Master load error", error);
    }

  }

  return entries;
}


// ================= LOAD INTERACTIONS =================

async function loadInteractions() {

  try {

    const data = await fetchViaProxy("/latest", "GET", null, "68862fd97b4b8670d8a81945");

    likesCache.data = data.likes || {};
    pinsCache.data = data.pins || {};

    likesCache.lastUpdated = Date.now();
    pinsCache.lastUpdated = Date.now();

  } catch (error) {

    console.error("Interaction load error", error);

    try {

      likesCache.data = JSON.parse(localStorage.getItem("entryLikes") || "{}");
      pinsCache.data = JSON.parse(localStorage.getItem("entryPins") || "{}");

    } catch (e) {
      console.error("LocalStorage error", e);
    }

  }

}


// ================= ENTRY GROUPING =================

function groupEntries(entries) {

  const parents = [];
  const childMap = new Map();

  entries.forEach(entry => {

    if (!entry.references || entry.references.length === 0) {
      parents.push(entry);
    } else {

      const parentId = entry.references[0];

      if (!childMap.has(parentId)) {
        childMap.set(parentId, []);
      }

      childMap.get(parentId).push(entry);

    }

  });

  parents.sort((a, b) => new Date(b.date) - new Date(a.date));

  const groups = [];

  parents.forEach(parent => {

    const children = childMap.get(parent.id) || [];

    children.sort((a, b) => new Date(b.date) - new Date(a.date));

    groups.push({
      parent,
      children
    });

  });

  return groups;

}


// ================= ENTRY ELEMENT =================

function createEntryElement(entry, depth = 0) {

  const entryDiv = document.createElement("div");
  entryDiv.className = "entry";

  if (depth > 0) {
    entryDiv.style.marginLeft = (depth * 30) + "px";
  }

  const time = new Date(entry.date).toLocaleString("tr-TR");

  entryDiv.innerHTML = `
  <div class="timestamp">${time}</div>
  <div class="entry-id">#${entry.id}</div>
  <div class="content">${entry.content}</div>
  `;

  return entryDiv;

}


// ================= PROCESS ENTRIES =================

function processEntries(entries) {

  const container = document.getElementById("entries");
  if (!container) return;

  container.innerHTML = "";

  allEntries = [...entries];

  if (entries.length !== lastEntryCount) {

    lastEntryCount = entries.length;

    if (lastEntryCount > 0) {
      window.scrollTo(0, 0);
    }

  }

  groupedEntries = groupEntries(entries);

  const groupsToShow = groupedEntries.slice(0, 5);

  groupsToShow.forEach(group => {

    const groupDiv = document.createElement("div");
    groupDiv.className = "entry-group";

    groupDiv.appendChild(createEntryElement(group.parent));

    group.children.forEach(child => {
      groupDiv.appendChild(createEntryElement(child, 1));
    });

    container.appendChild(groupDiv);

  });

}


// ================= CHECK NEW ENTRIES =================

async function checkForNewEntries() {

  try {

    const entries = await loadAllEntries();

    if (entries.length !== lastEntryCount) {
      processEntries(entries);
    }

  } catch (error) {
    console.error("Entry check error:", error);
  }

}


// ================= INIT =================

async function initializeApp() {

  try {

    await initializeBinSystem();

    const entries = await loadAllEntries();

    await loadInteractions();

    processEntries(entries);

    checkInterval = setInterval(checkForNewEntries, refreshInterval);

  } catch (error) {

    console.error("Initialization error:", error);

    const el = document.getElementById("entries");

    if (el) {
      el.innerHTML = '<div class="error">Veriler yüklenirken hata oluştu</div>';
    }

  }

}


// ================= START =================

document.addEventListener("DOMContentLoaded", initializeApp);

window.addEventListener("beforeunload", () => {
  if (checkInterval) clearInterval(checkInterval);
});
