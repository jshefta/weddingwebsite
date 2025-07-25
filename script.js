
let guestList = [];
let matchedParty = null;

// Fetch guest list from the backend on page load
window.addEventListener("DOMContentLoaded", () => {
  fetch("https://script.google.com/macros/s/AKfycbwjrDEaKrm-2J6lyaHKEKGuCBrFw1WpLhpqHwt93fVVFqkSEwvhKdaEYImbTK-0iu7r9Q/exec")
    .then(response => response.json())
    .then(data => {
      guestList = data;
      console.log("✅ Guest list loaded:", guestList);
    })
    .catch(error => {
      console.error("❌ Failed to load guest list:", error);
    });
});

function findGuest() {
  const nameInput = document.getElementById('guestName').value.trim().toLowerCase();
  matchedParty = guestList.find(party =>
    party.partyNames.some(name => name.toLowerCase().includes(nameInput))
  );

  const result = document.getElementById('lookupResult');
  const form = document.getElementById('rsvpForm');
  const guestOptions = document.getElementById('guestOptions');

  if (matchedParty) {
    result.textContent = "We found your invitation!";
    form.style.display = "block";

    let html = matchedParty.partyNames.map(name => `
      <div>
        <label>${name}</label>
        <select name="\${name}">
          <option value="yes">Will attend</option>
          <option value="no">Will not attend</option>
        </select>
      </div>
    `).join("");

    if (matchedParty.plusOneAllowed === true) {
      html += `
        <div>
          <label>Plus One Name:</label>
          <input type="text" name="plusOneName" placeholder="First and last name">
          <label>Will your plus one attend?</label>
          <select name="plusOneAttending">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      `;
    }

    guestOptions.innerHTML = html;
  } else {
    result.textContent = "Sorry, we couldn’t find your name. Please check spelling.";
    form.style.display = "none";
  }
}

function submitRSVP(event) {
  event.preventDefault();
  console.log("Submitting RSVP to Google Sheets...");

  const formData = new FormData(document.getElementById('rsvpForm'));
  const rsvpData = {
    partyId: matchedParty.partyId,
    responses: [],
    email: formData.get("email"),
    phone: formData.get("phone")
  };

  matchedParty.partyNames.forEach(name => {
    rsvpData.responses.push({
      name,
      attending: formData.get(name),
      isPlusOne: false,
      plusOneName: ""
    });
  });

  if (matchedParty.plusOneAllowed === true) {
    const rawPlusOne = formData.get("plusOneName");
    const plusOneName = rawPlusOne ? rawPlusOne.trim() : "";
    const plusOneAttending = formData.get("plusOneAttending");
    if (plusOneName) {
      rsvpData.responses.push({
        name: plusOneName,
        attending: plusOneAttending,
        isPlusOne: true,
        plusOneName: plusOneName
      });
    }
  }

  fetch("https://script.google.com/macros/s/AKfycbx-zXSv8LXrcY2MGNdQ1x6vC4WYlfWyZI80e9uiWLKP4hpzmKaAPAXLbsSBYq9RRA7yqw/exec", {
    method: "POST",
    body: JSON.stringify(rsvpData),
    headers: { "Content-Type": "application/json" }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Thank you for your RSVP!");
      document.getElementById("rsvpForm").reset();
      document.getElementById("rsvpForm").style.display = "none";
      document.getElementById("guestName").value = "";
    } else {
      alert("Error submitting RSVP. Please try again.");
    }
  })
  .catch(error => {
    console.error("Fetch error:", error);
    alert("There was a problem submitting your RSVP.");
  });
}

function addCorsHeaders(response) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  for (const key in headers) {
    response.appendHeader(key, headers[key]);
  }

  return response;
}
