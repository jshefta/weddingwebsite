
// Password protection
const CORRECT_PASSWORD = "peanut";

function checkPassword() {
  const isAuthenticated = sessionStorage.getItem('weddingSiteAuthenticated');
  
  if (!isAuthenticated) {
    showPasswordPrompt();
    return false;
  }
  return true;
}

function showPasswordPrompt() {
  // Hide the main content but keep body visible for the overlay
  const mainContent = document.querySelector('main');
  const nav = document.querySelector('nav');
  const footer = document.querySelector('footer');
  
  if (mainContent) mainContent.style.display = 'none';
  if (nav) nav.style.display = 'none';
  if (footer) footer.style.display = 'none';
  
  // Create password prompt overlay
  const overlay = document.createElement('div');
  overlay.id = 'passwordOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000000;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    font-family: 'Calibre', sans-serif;
  `;
  
  const promptContainer = document.createElement('div');
  promptContainer.style.cssText = `
    text-align: center;
    max-width: 400px;
    width: 90%;
    color: #ffffff;
  `;
  

  
  const passwordLabel = document.createElement('p');
  passwordLabel.textContent = 'Enter your password';
  passwordLabel.style.cssText = `
    margin: 0 0 15px 0;
    color: #ffffff;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-family: 'Calibre', sans-serif;
  `;
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Enter password';
  passwordInput.style.cssText = `
    width: 100%;
    padding: 12px 15px;
    border: none;
    font-size: 16px;
    margin-bottom: 20px;
    box-sizing: border-box;
    background: #ffffff;
    color: #000000;
    border-radius: 0;
  `;
  
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Enter';
  submitButton.style.cssText = `
    background: #de1808;
    color: white;
    border: 2px solid #ffffff;
    padding: 12px 30px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    font-family: 'Instrument Serif', serif;
    font-weight: 400;
    text-transform: uppercase;
  `;
  
  const errorMessage = document.createElement('p');
  errorMessage.style.cssText = `
    color: #de1808;
    margin: 10px 0 0 0;
    font-size: 14px;
    display: none;
  `;
  
  // Add hover effects
  submitButton.addEventListener('mouseenter', () => {
    submitButton.style.background = '#b01406';
    submitButton.style.transform = 'translateY(-2px)';
  });
  
  submitButton.addEventListener('mouseleave', () => {
    submitButton.style.background = '#de1808';
    submitButton.style.transform = 'translateY(0)';
  });
  

  
  // Handle password submission
  function handlePasswordSubmit() {
    const enteredPassword = passwordInput.value.trim();
    
    if (enteredPassword.toLowerCase() === CORRECT_PASSWORD.toLowerCase()) {
      sessionStorage.setItem('weddingSiteAuthenticated', 'true');
      
      // Show the content again
      if (mainContent) mainContent.style.display = 'block';
      if (nav) nav.style.display = 'block';
      if (footer) footer.style.display = 'block';
      
      overlay.remove();
      
      // Force layout recalculation to fix centering issues
      setTimeout(() => {
        if (mainContent) mainContent.style.display = 'block';
        // Force a reflow to ensure proper centering
        document.body.offsetHeight;
      }, 10);
    } else {
      errorMessage.textContent = 'Incorrect password. Please try again.';
      errorMessage.style.display = 'block';
      passwordInput.value = '';
      passwordInput.focus();
    }
  }
  
  submitButton.addEventListener('click', handlePasswordSubmit);
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  });
  
  // Assemble the prompt
  promptContainer.appendChild(passwordLabel);
  promptContainer.appendChild(passwordInput);
  promptContainer.appendChild(submitButton);
  promptContainer.appendChild(errorMessage);
  overlay.appendChild(promptContainer);
  document.body.appendChild(overlay);
  
  // Focus on password input
  passwordInput.focus();
}

// Initialize mobile menu functionality immediately
function initializeMobileMenu() {
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const navBar = document.getElementById('navBar');
  
  console.log('Mobile menu elements found:', { hamburgerMenu, navBar });
  
  if (hamburgerMenu && navBar) {
    function toggleMenu(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Hamburger menu clicked/touched');
      hamburgerMenu.classList.toggle('active');
      navBar.classList.toggle('active');
      console.log('Menu classes after toggle:', {
        hamburgerActive: hamburgerMenu.classList.contains('active'),
        navActive: navBar.classList.contains('active')
      });
    }
    
    // Add both click and touchstart events for better mobile support
    hamburgerMenu.addEventListener('click', toggleMenu);
    hamburgerMenu.addEventListener('touchstart', toggleMenu);
    
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
}

// Check password on page load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile menu functionality immediately, regardless of password status
  initializeMobileMenu();
  
  if (!checkPassword()) {
    return; // Stop execution if not authenticated
  }
  
  // Add event listener for the find guest button
  const findGuestBtn = document.getElementById('findGuestBtn');
  if (findGuestBtn) {
    findGuestBtn.addEventListener('click', findGuest);
  }
  
  
  // Add event listener for the RSVP form submission
  const rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', submitRSVP);
  }
  
  // Add event listener for the reset form button
  const resetFormBtn = document.getElementById('resetFormBtn');
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', resetForm);
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
    let allRecords = [];
    let offset = null;
    
    do {
      const url = offset 
        ? `${AIRTABLE_ENDPOINT}?pageSize=100&offset=${offset}`
        : `${AIRTABLE_ENDPOINT}?pageSize=100`;
        
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`
        }
      });
      const data = await response.json();
      
      if (data.records) {
        allRecords = allRecords.concat(data.records);
      }
      
      offset = data.offset;
    } while (offset);
    
    console.log("🔍 Debug: Raw Airtable data:", { records: allRecords });
    console.log("🔍 Debug: Total records received:", allRecords.length);
    

    
    guestList = processGuestRecords(allRecords);

    
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
    const plusOneName = fields["Plus One Name"] || "";
    const phone = fields["Phone"] || "";
    const recordId = record.id;



    if (!parties[partyId]) {
      parties[partyId] = {
        partyId,
        partyNames: [],
        plusOneAllowed,
        rsvpStatus: {},
        recordIds: {},
        plusOneName: "",
        phone: ""
      };
    }

    if (name) {
      parties[partyId].partyNames.push(name);
      // Store RSVP status and record ID for each guest
      parties[partyId].rsvpStatus[name] = attending;
      parties[partyId].recordIds[name] = recordId;
      
      // Store plus one name and phone from the first guest in the party
      // (assuming all guests in a party have the same plus one and phone)
      if (parties[partyId].partyNames.length === 1) {
        parties[partyId].plusOneName = plusOneName;
        parties[partyId].phone = phone;
      }
    }

    if (plusOneAllowed) {
      parties[partyId].plusOneAllowed = true;
    }
  });

  return Object.values(parties);
}

function findGuest() {
  const nameInput = document.getElementById('guestName').value.trim().toLowerCase();
  
  // Try exact match first, then partial match
  matchedParty = guestList.find(party =>
    party.partyNames.some(name => name.toLowerCase() === nameInput)
  );
  
  // If no exact match, try partial match
  if (!matchedParty) {
    matchedParty = guestList.find(party =>
      party.partyNames.some(name => name.toLowerCase().includes(nameInput))
    );
  }
  
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
    
    // Auto-populate plus one name if RSVP is confirmed
    if (hasRSVPed) {
      const plusOneInput = document.getElementById('plusOneName');
      
      if (plusOneInput && matchedParty.plusOneName) {
        plusOneInput.value = matchedParty.plusOneName;
      }
      
      // Update the RSVP form button text
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.textContent = 'Update RSVP';
      }
    } else {
      // Reset button text for new RSVPs
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.textContent = 'Review RSVP';
      }
    }
  } else {
    result.textContent = "Sorry, we couldn't find your name. Please check spelling.";
    form.style.display = "none";
  }
}

function checkPartyRSVPStatus(party) {
  // Check if any guest in the party has RSVPed (has a non-null attending value)
  return party.partyNames.some(name => party.rsvpStatus[name] !== null && party.rsvpStatus[name] !== undefined);
}


function submitRSVP(event) {
  event.preventDefault();
  
  const formData = new FormData(document.getElementById('rsvpForm'));
  currentRSVPData = {
    partyId: matchedParty.partyId,
    partyNames: matchedParty.partyNames,
    plusOneAllowed: matchedParty.plusOneAllowed,
    plusOneName: formData.get("plusOneName") || "",
    responses: {}
  };

  // Collect responses for each guest
  matchedParty.partyNames.forEach(name => {
    currentRSVPData.responses[name] = formData.get(name);
  });

  // Submit directly to Airtable
  confirmAndSubmit();
}

function showConfirmationScreen() {
  // Hide the RSVP form
  document.getElementById('rsvpForm').style.display = 'none';
  
  // Get the first name of the primary guest
  const primaryGuestName = matchedParty.partyNames[0];
  const firstName = primaryGuestName.split(' ')[0];
  
  // Create personalized thank you message
  const confirmationMessage = document.getElementById('confirmationMessage');
  const messageHTML = `
    <div class="thank-you-message">
      <h2>Thank you, ${firstName}.</h2>
      <p>Please reach out if you have any questions.</p>
    </div>
  `;
  
  confirmationMessage.innerHTML = messageHTML;

  // Show confirmation screen
  document.getElementById('confirmationScreen').style.display = 'block';
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
      "Plus One Name": currentRSVPData.plusOneName || "",
      "Responded": "Yes"
    }
  }));

  console.log("🔍 Debug: Records to update:", records);
  console.log("🔍 Debug: Request body:", JSON.stringify({ records }, null, 2));
  console.log("🔍 Debug: Field names being updated:", Object.keys(records[0].fields));

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
    console.log("🔍 Debug: Response data:", JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      console.error("❌ Airtable API Error:", result);
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(result)}`);
    }
    
    // Reload the guest list to reflect the updated status
    await loadGuestList();
    
    // Show confirmation screen with RSVP details
    showConfirmationScreen();
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
