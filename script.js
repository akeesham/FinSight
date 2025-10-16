	async function getAccessToken() {
      const tokenUrl = 'https://bn5fuxee.pegace.net/prweb/PRRestService/oauth2/v1/token';
      const clientId = '14385166056247839722';
      const clientSecret = '65B93F27BE2ED08E0123DB7A4BFAA751';

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get access token: ' + response.status);
      }

      const data = await response.json();
      return data.access_token;
    }

    async function handleSubmit(event) {
      event.preventDefault();
      const caseID = document.getElementById('userInput').value.trim();
      const output = document.getElementById('output');

      if (!caseID) {
        output.innerHTML = '<p>Please enter a Case ID.</p>';
        return;
      }

      output.innerHTML = '<p>Fetching access token and case details...</p>';

      try {
        const token = await getAccessToken();

        // Call the GET case details DX API
        const url = `https://bn5fuxee.pegace.net/prweb/app/fin-sight/api/application/v2/cases/${caseID}?viewType=none`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch case details: ' + response.status);
        }

        const json = await response.json();
        const caseInfo = json?.data?.caseInfo;

        if (!caseInfo) {
          output.innerHTML = '<p>No case details found.</p>';
          return;
        }

        // Extract key fields
        const caseId = caseInfo.ID || 'N/A';
        const businessId = caseInfo.businessID || 'N/A';
        const caseType = caseInfo.caseTypeName || 'N/A';
        const status = caseInfo.status || 'N/A';
        const stage = caseInfo.stageLabel || 'N/A';
        const owner = caseInfo.owner || 'N/A';
        const urgency = caseInfo.urgency || 'N/A';
        const loanAmount = caseInfo.content?.LoanAmountRequested || 'N/A';
        const created = caseInfo.createTime || 'N/A';
        const updated = caseInfo.lastUpdateTime || 'N/A';

        // Render in UI
        output.innerHTML = `
          <p><span class="label">Case ID:</span> ${caseId}</p>
          <p><span class="label">Business ID:</span> ${businessId}</p>
          <p><span class="label">Case Type:</span> ${caseType}</p>
          <p><span class="label">Status:</span> ${status}</p>
          <p><span class="label">Current Stage:</span> ${stage}</p>
          <p><span class="label">Owner:</span> ${owner}</p>
          <p><span class="label">Urgency:</span> ${urgency}</p>
          <p><span class="label">Loan Amount:</span> ${loanAmount}</p>
          <p><span class="label">Created On:</span> ${created}</p>
          <p><span class="label">Last Updated:</span> ${updated}</p>
        `;
      } catch (error) {
        output.innerHTML = `<p style="color:red;">❌ Error: ${error.message}</p>`;
      }
    }