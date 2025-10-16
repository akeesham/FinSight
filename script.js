// ================================
// Loan Application JS (Frontend)
// ================================

// Section switching (global function)
function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(sec => sec.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';
  const output = document.getElementById('output');
  output.innerText = '';
  output.className = '';
}

// ================================
// Navbar event listeners
// ================================
document.getElementById('navHome').addEventListener('click', () => showSection('home'));
document.getElementById('navCreateLoan').addEventListener('click', () => showSection('createLoan'));
document.getElementById('navGetLoan').addEventListener('click', () => showSection('getLoan'));

// ================================
// Button event listeners
// ================================
document.getElementById('btnCreateLoan').addEventListener('click', createLoanApplication);
document.getElementById('btnGetLoan').addEventListener('click', getLoanApplicationDetails);

// ================================
// Fetch Access Token via Netlify Function
// ================================
async function getAccessToken() {
  const response = await fetch("/.netlify/functions/getAccessToken");
  if (!response.ok) throw new Error("Failed to get access token");
  const data = await response.json();
  return data.access_token;
}

// ================================
// Create Loan Application
// ================================
async function createLoanApplication() {
  const output = document.getElementById("output");
  const caseTypeID = document.getElementById("caseTypeID").value.trim();
  const loanAmount = document.getElementById("loanAmount").value.trim();

  if (!caseTypeID || !loanAmount || parseInt(loanAmount) <= 0) {
    output.className = "error";
    output.innerText = "Please enter a valid Case Type ID and Loan Amount greater than 0.";
    return;
  }

  output.className = "";
  output.innerText = "Creating loan application...";

  try {
    const token = await getAccessToken();
    const url = "https://bn5fuxee.pegace.net/prweb/app/fin-sight/api/application/v2/cases";
    const payload = {
      caseTypeID: caseTypeID,
      content: { LoanAmountRequested: parseInt(loanAmount) }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Failed to create loan application");

    const data = await response.json();
    output.className = "success";
    output.innerHTML = `
      <table>
        <tr><td>Loan Application ID:</td><td>${data.ID || data.caseID}</td></tr>
        <tr><td>Status:</td><td>${data.status || "New"}</td></tr>
        <tr><td>Loan Amount:</td><td>${loanAmount}</td></tr>
      </table>`;
  } catch (error) {
    output.className = "error";
    output.innerText = "❌ Error: " + error.message;
  }
}

// ================================
// Get Loan Application Details
// ================================
async function getLoanApplicationDetails() {
  const output = document.getElementById("output");
  const caseSuffix = document.getElementById("caseID").value.trim();

  if (!caseSuffix) {
    output.className = "error";
    output.innerText = "Please enter the Loan Application ID suffix (e.g., L-2).";
    return;
  }

  const caseID = "MYORG-FINSIGHT-WORK " + caseSuffix;

  output.className = "";
  output.innerText = "Fetching loan application details...";

  try {
    const token = await getAccessToken();
    const url = `https://bn5fuxee.pegace.net/prweb/app/fin-sight/api/application/v2/cases/${encodeURIComponent(caseID)}?viewType=none`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Authorization": "Bearer " + token }
    });

    if (!response.ok) throw new Error("Failed to fetch loan application details");

    const json = await response.json();
    const info = json.data.caseInfo;
    const content = info.content;

    output.className = "success";
    output.innerHTML = `
      <table>
        <tr><td>Loan Application ID:</td><td>${info.ID}</td></tr>
        <tr><td>Business ID:</td><td>${info.businessID}</td></tr>
        <tr><td>Case Type:</td><td>${info.caseTypeName}</td></tr>
        <tr><td>Status:</td><td>${info.status}</td></tr>
        <tr><td>Stage:</td><td>${info.stageLabel}</td></tr>
        <tr><td>Owner:</td><td>${info.owner}</td></tr>
        <tr><td>Loan Amount:</td><td>${content.LoanAmountRequested}</td></tr>
        <tr><td>Created On:</td><td>${info.createTime}</td></tr>
        <tr><td>Last Updated:</td><td>${info.lastUpdateTime}</td></tr>
      </table>`;
  } catch (error) {
    output.className = "error";
    output.innerText = "❌ Error: " + error.message;
  }
}
