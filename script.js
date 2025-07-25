
// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const navBar = document.getElementById('navBar');
  
  if (hamburgerMenu && navBar) {
    hamburgerMenu.addEventListener('click', function() {
      hamburgerMenu.classList.toggle('active');
      navBar.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    const navLinks = navBar.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburgerMenu.classList.remove('active');
        navBar.classList.remove('active');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!hamburgerMenu.contains(event.target) && !navBar.contains(event.target)) {
        hamburgerMenu.classList.remove('active');
        navBar.classList.remove('active');
      }
    });
  }
});

const AIRTABLE_BASE_ID = "appwvJpPa39Qg9LDh";
const AIRTABLE_TABLE_NAME = "Guests";
const AIRTABLE_TOKEN = "patacrtltldFchKGR.b8dd1ae7be19e4b9cff95bbe8fd4b614faf6f0dafbc50e17ed513be2f2743d45";

const AIRTABLE_ENDPOINT = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

let guestList = [];
let matchedParty = null;
let currentRSVPData = null;

async function loadGuestList() {
  try {
    const response = await fetch(AIRTABLE_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });
    const data = await response.json();
    console.log("🔍 Debug: Raw Airtable data:", data);
    guestList = processGuestRecords(data.records);
    console.log("🔍 Debug: Processed guest list:", guestList);
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
    const attending = fields["Attending"];
    const recordId = record.id;

    if (!parties[partyId]) {
      parties[partyId] = {
        partyId,
        partyNames: [],
        plusOneAllowed,
        rsvpStatus: {},
        recordIds: {}
      };
    }

    if (name) {
      parties[partyId].partyNames.push(name);
      // Store RSVP status and record ID for each guest
      parties[partyId].rsvpStatus[name] = attending;
      parties[partyId].recordIds[name] = recordId;
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
  const rsvpStatus = document.getElementById('rsvpStatus');

  if (matchedParty) {
    result.textContent = "We found your invitation!";
    form.style.display = "block";
    
    // Check RSVP status for the party
    const hasRSVPed = checkPartyRSVPStatus(matchedParty);
    
    // Display RSVP status
    if (hasRSVPed) {
      rsvpStatus.innerHTML = '<div class="status-badge confirmed">RSVP Confirmed</div>';
    } else {
      rsvpStatus.innerHTML = '<div class="status-badge pending">Awaiting RSVP</div>';
    }
    
    // Pre-fill form with existing RSVP data if available
    guestOptions.innerHTML = matchedParty.partyNames.map(name => {
      const existingResponse = matchedParty.rsvpStatus[name];
      const selectedYes = existingResponse === 'Yes' ? 'selected' : '';
      const selectedNo = existingResponse === 'No' ? 'selected' : '';
      
      return `
        <div>
          <label>${name}</label>
          <select name="${name}">
            <option value="Yes" ${selectedYes}>Will attend</option>
            <option value="No" ${selectedNo}>Will not attend</option>
          </select>
        </div>
      `;
    }).join("");

    plusOneContainer.style.display = matchedParty.plusOneAllowed ? "block" : "none";
  } else {
    result.textContent = "Sorry, we couldn't find your name. Please check spelling.";
    form.style.display = "none";
  }
}

function checkPartyRSVPStatus(party) {
  // Check if any guest in the party has RSVPed (has a non-null attending value)
  return party.partyNames.some(name => party.rsvpStatus[name] !== null && party.rsvpStatus[name] !== undefined);
}


function showConfirmation(event) {
  event.preventDefault();
  
  const formData = new FormData(document.getElementById('rsvpForm'));
  currentRSVPData = {
    partyId: matchedParty.partyId,
    partyNames: matchedParty.partyNames,
    plusOneAllowed: matchedParty.plusOneAllowed,
    plusOneName: formData.get("plusOneName") || "",
    email: formData.get("email"),
    phone: formData.get("phone"),
    responses: {}
  };

  // Collect responses for each guest
  matchedParty.partyNames.forEach(name => {
    currentRSVPData.responses[name] = formData.get(name);
  });

  // Display confirmation details
  const confirmationDetails = document.getElementById('confirmationDetails');
  let detailsHTML = '<div class="confirmation-summary">';
  
  // Guest responses
  detailsHTML += '<h3>Guest Responses:</h3>';
  matchedParty.partyNames.forEach(name => {
    const response = currentRSVPData.responses[name];
    const statusClass = response === 'Yes' ? 'attending' : 'not-attending';
    detailsHTML += `<p><strong>${name}:</strong> <span class="${statusClass}">${response}</span></p>`;
  });

  // Plus one information
  if (matchedParty.plusOneAllowed && currentRSVPData.plusOneName) {
    detailsHTML += `<p><strong>Plus One:</strong> ${currentRSVPData.plusOneName}</p>`;
  }

  // Contact information
  detailsHTML += '<h3>Contact Information:</h3>';
  detailsHTML += `<p><strong>Email:</strong> ${currentRSVPData.email}</p>`;
  if (currentRSVPData.phone) {
    detailsHTML += `<p><strong>Phone:</strong> ${currentRSVPData.phone}</p>`;
  }

  detailsHTML += '</div>';

  confirmationDetails.innerHTML = detailsHTML;

  // Show confirmation screen, hide form
  document.getElementById('rsvpForm').style.display = 'none';
  document.getElementById('confirmationScreen').style.display = 'block';
}

function editRSVP() {
  // Hide confirmation screen, show form
  document.getElementById('confirmationScreen').style.display = 'none';
  document.getElementById('rsvpForm').style.display = 'block';
}

async function confirmAndSubmit() {
  if (!currentRSVPData) {
    alert("No RSVP data to submit. Please try again.");
    return;
  }

  console.log("🔍 Debug: Current RSVP Data:", currentRSVPData);
  console.log("🔍 Debug: Matched Party:", matchedParty);

  // Create records array for PATCH request (updating existing records)
  // Let's start with just the Attending field to test
  const records = matchedParty.partyNames.map(name => ({
    id: matchedParty.recordIds[name],
    fields: {
      "Attending": currentRSVPData.responses[name]
    }
  }));

  console.log("🔍 Debug: Records to update:", records);
  console.log("🔍 Debug: Request body:", JSON.stringify({ records }, null, 2));

  try {
    console.log("🔍 Debug: Making PATCH request to:", AIRTABLE_ENDPOINT);
    const response = await fetch(AIRTABLE_ENDPOINT, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ records })
    });

    console.log("🔍 Debug: Response status:", response.status);
    console.log("🔍 Debug: Response headers:", response.headers);

    const result = await response.json();
    console.log("✅ RSVP updated:", result);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(result)}`);
    }
    
    // Reload the guest list to reflect the updated status
    await loadGuestList();
    
    // Show success message
    document.getElementById('confirmationScreen').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
  } catch (error) {
    console.error("❌ Failed to update RSVP:", error);
    console.error("❌ Error details:", error.message);
    alert("There was an error updating your RSVP. Please try again. Check console for details.");
  }
}

function resetForm() {
  // Reset all form elements
  document.getElementById('guestName').value = '';
  document.getElementById('lookupResult').textContent = '';
  document.getElementById('rsvpForm').reset();
  document.getElementById('rsvpForm').style.display = 'none';
  document.getElementById('successMessage').style.display = 'none';
  document.getElementById('confirmationScreen').style.display = 'none';
  document.getElementById('rsvpStatus').innerHTML = '';
  
  // Reset global variables
  matchedParty = null;
  currentRSVPData = null;
}
