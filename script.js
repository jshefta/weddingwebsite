
// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const navBar = document.getElementById('navBar');
  
  console.log('Mobile menu elements found:', { hamburgerMenu, navBar });
  
  if (hamburgerMenu && navBar) {
    hamburgerMenu.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Hamburger menu clicked');
      hamburgerMenu.classList.toggle('active');
      navBar.classList.toggle('active');
      console.log('Menu classes after toggle:', {
        hamburgerActive: hamburgerMenu.classList.contains('active'),
        navActive: navBar.classList.contains('active')
      });
    });
    
    // Close menu when clicking on a link
    const navLinks = navBar.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        console.log('Nav link clicked, closing menu');
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
  } else {
    console.error('Mobile menu elements not found:', { hamburgerMenu, navBar });
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
    
    // Check for party 29 specifically
    const party29Records = data.records.filter(record => 
      record.fields["Party ID"] === 29
    );
    console.log("🔍 Debug: Party 29 records:", party29Records);
    
    guestList = processGuestRecords(data.records);
    console.log("🔍 Debug: Processed guest list:", guestList);
    
    // Check if party 29 exists in processed data
    const party29Processed = guestList.find(party => party.partyId === 29);
    console.log("🔍 Debug: Party 29 in processed data:", party29Processed);
    
    console.log("✅ Guest list loaded");
  } catch (error) {
    console.error("❌ Failed to load guest list:", error);
  }
}

function processGuestRecords(records) {
  console.log("🔍 Debug: Processing", records.length, "records");
  
  // Log the first few records to see field structure
  if (records.length > 0) {
    console.log("🔍 Debug: First record fields:", Object.keys(records[0].fields));
    console.log("🔍 Debug: First record data:", records[0].fields);
  }
  
  const parties = {};
  records.forEach((record, index) => {
    const fields = record.fields;
    const partyId = fields["Party ID"];
    const name = fields["Name"];
    const plusOneAllowed = fields["Plus One?"] || false;
    const attending = fields["Attending"];
    const recordId = record.id;

    // Debug party 29 specifically
    if (partyId === 29) {
      console.log(`🔍 Debug: Party 29 record ${index}:`, {
        partyId,
        name,
        plusOneAllowed,
        attending,
        recordId,
        allFields: fields
      });
    }

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
  console.log("🔍 Searching for:", nameInput);
  console.log("🔍 Available parties:", guestList.map(party => ({
    partyId: party.partyId,
    partyNames: party.partyNames
  })));
  
  // More detailed debugging
  guestList.forEach((party, index) => {
    console.log(`🔍 Party ${index}:`, party.partyId, "Names:", party.partyNames);
    party.partyNames.forEach(name => {
      console.log(`  - "${name.toLowerCase()}" includes "${nameInput}":`, name.toLowerCase().includes(nameInput));
    });
  });
  
  // Search specifically for Matt and Archie
  const mattParty = guestList.find(party => 
    party.partyNames.some(name => name.toLowerCase().includes('matt'))
  );
  const archieParty = guestList.find(party => 
    party.partyNames.some(name => name.toLowerCase().includes('archie'))
  );
  
  console.log("🔍 Party with Matt:", mattParty);
  console.log("🔍 Party with Archie:", archieParty);
  
  matchedParty = guestList.find(party =>
    party.partyNames.some(name => name.toLowerCase().includes(nameInput))
  );
  
  console.log("🔍 Matched party:", matchedParty);

  const result = document.getElementById('lookupResult');
  const form = document.getElementById('rsvpForm');
  const guestOptions = document.getElementById('guestOptions');
  const plusOneContainer = document.getElementById('plusOneContainer');
  const rsvpStatus = document.getElementById('rsvpStatus');
  const lookup = document.getElementById('lookup');

  if (matchedParty) {
    // Hide the entire lookup section
    lookup.style.display = "none";
    
    // Show the RSVP form
    form.style.display = "block";
    
    // Check RSVP status for the party
    const hasRSVPed = checkPartyRSVPStatus(matchedParty);
    
    // Get first names from all party members
    const firstNames = matchedParty.partyNames.map(name => name.split(' ')[0]);
    
    // Display RSVP status
    if (hasRSVPed) {
      let greeting;
      if (firstNames.length === 1) {
        greeting = `Hey ${firstNames[0]}`;
      } else if (firstNames.length === 2) {
        greeting = `Hey ${firstNames[0]} and ${firstNames[1]}`;
      } else {
        // For 3+ names, use "and" format
        const lastFirstName = firstNames.pop();
        greeting = `Hey ${firstNames.join(', ')} and ${lastFirstName}`;
      }
      
      rsvpStatus.innerHTML = `<div class="status-badge confirmed">${greeting}, we found your invitation and the RSVP is confirmed!</div>`;
    } else {
      let greeting;
      if (firstNames.length === 1) {
        greeting = `Hey ${firstNames[0]}`;
      } else if (firstNames.length === 2) {
        greeting = `Hey ${firstNames[0]} and ${firstNames[1]}`;
      } else {
        // For 3+ names, use "and" format
        const lastFirstName = firstNames.pop();
        greeting = `Hey ${firstNames.join(', ')} and ${lastFirstName}`;
      }
      
      rsvpStatus.innerHTML = `<div class="status-badge pending">${greeting}, we found your invitation and are waiting for your RSVP</div>`;
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
  const records = matchedParty.partyNames.map(name => ({
    id: matchedParty.recordIds[name],
    fields: {
      "Attending": currentRSVPData.responses[name],
      "Responded": "Yes",
      "Phone": currentRSVPData.phone || "",
      "Plus One": currentRSVPData.plusOneName || ""
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
  
  // Show the lookup section again
  document.getElementById('lookup').style.display = 'block';
  
  // Reset global variables
  matchedParty = null;
  currentRSVPData = null;
}
