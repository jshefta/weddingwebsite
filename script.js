
const AIRTABLE_BASE_ID = "wvJpPa39Qg9LDh";
const AIRTABLE_TABLE_NAME = "Guests";
const AIRTABLE_TOKEN = "patacrtltldFchKGR.b8dd1ae7be19e4b9cff95bbe8fd4b614faf6f0dafbc50e17ed513be2f2743d45";

const AIRTABLE_ENDPOINT = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

async function loadGuestList() {
  try {
    const response = await fetch(AIRTABLE_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });
    const data = await response.json();
    window.guestList = processGuestRecords(data.records);
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
    const name = fields["Guest Name"];
    const plusOneAllowed = fields["Plus One Allowed"] || false;

    if (!parties[partyId]) {
      parties[partyId] = {
        partyId: partyId,
        partyNames: [],
        plusOneAllowed: plusOneAllowed
      };
    }

    if (!fields["Is Plus One"]) {
      parties[partyId].partyNames.push(name);
    }

    if (plusOneAllowed) {
      parties[partyId].plusOneAllowed = true;
    }
  });

  return Object.values(parties);
}

async function submitRSVP(data) {
  try {
    const rows = data.responses.map(guest => {
      return {
        fields: {
          "Party ID": data.partyId,
          "Guest Name": guest.name,
          "RSVP Status": guest.attending,
          "Email": data.email,
          "Phone": data.phone,
          "Is Plus One": guest.isPlusOne || false,
          "Plus One Name": guest.plusOneName || ""
        }
      };
    });

    const response = await fetch(AIRTABLE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ records: rows })
    });

    const result = await response.json();
    console.log("✅ RSVP submitted:", result);
    alert("Thank you for your RSVP!");
  } catch (error) {
    console.error("❌ Failed to submit RSVP:", error);
    alert("There was an error submitting your RSVP. Please try again.");
  }
}
// comment// force update
