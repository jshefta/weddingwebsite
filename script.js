
const AIRTABLE_BASE_ID = "wvJpPa39Qg9LDh";
const AIRTABLE_TABLE_NAME = "Guests";
const AIRTABLE_TOKEN = "patacrtltldFchKGR.b8dd1ae7be19e4b9cff95bbe8fd4b614faf6f0dafbc50e17ed513be2f2743d45";

const AIRTABLE_ENDPOINT = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

let guestList = [];
let matchedParty = null;

async function loadGuestList() {
  try {
    const response = await fetch(AIRTABLE_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });
    const data = await response.json();
    guestList = processGuestRecords(data.records);
    console.log("✅ Guest list loaded");
  } catch (error) {
    console.error("❌ Failed to load guest list:", error);
  }
}

function processGuestRecords(records) {
  const parties = {};
  records.forEach(record => {
    const fields = record.fields;
    const partyId = fields["Party ID"];
    const name = fields["Name"];
    const plusOneAllowed = fields["Plus One?"] || false;

    if (!parties[partyId]) {
      parties[partyId] = {
        partyId,
        partyNames: [],
        plusOneAllowed
      };
    }

    if (name) {
      parties[partyId].partyNames.push(name);
    }

    if (plusOneAllowed) {
      parties[partyId].plusOneAllowed = true;
    }
  });

  return Object.values(parties);
}

function findGuest() {
  const nameInput = document.getElementById('guestName').value.trim().toLowerCase();
  matchedParty = guestList.find(party =>
    party.partyNames.some(name => name.toLowerCase().includes(nameInput))
  );

  const result = document.getElementById('lookupResult');
  const form = document.getElementById('rsvpForm');
  const guestOptions = document.getElementById('guestOptions');
  const plusOneContainer = document.getElementById('plusOneContainer');

  if (matchedParty) {
    result.textContent = "We found your invitation!";
    form.style.display = "block";
    guestOptions.innerHTML = matchedParty.partyNames.map(name => `
      <div>
        <label>${name}</label>
        <select name="${name}">
          <option value="Yes">Will attend</option>
          <option value="No">Will not attend</option>
        </select>
      </div>
    `).join("");

    plusOneContainer.style.display = matchedParty.plusOneAllowed ? "block" : "none";
  } else {
    result.textContent = "Sorry, we couldn’t find your name. Please check spelling.";
    form.style.display = "none";
  }
}

async function submitRSVP(event) {
  event.preventDefault();
  const formData = new FormData(document.getElementById('rsvpForm'));
  const records = matchedParty.partyNames.map(name => ({
    fields: {
      "Party ID": matchedParty.partyId,
      "Name": name,
      "Attending": formData.get(name),
      "Phone": formData.get("phone"),
      "Plus One?": matchedParty.plusOneAllowed ? true : false,
      "Plus One Name": matchedParty.plusOneAllowed ? formData.get("plusOneName") : ""
    }
  }));

  try {
    const response = await fetch(AIRTABLE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ records })
    });

    const result = await response.json();
    console.log("✅ RSVP submitted:", result);
    alert("Thank you for your RSVP!");
  } catch (error) {
    console.error("❌ Failed to submit RSVP:", error);
    alert("There was an error submitting your RSVP. Please try again.");
  }
}
