// Netlify serverless function to get Pega OAuth token
import fetch from "node-fetch";

export async function handler(event, context) {
  const clientId = process.env.ClientID;         // Set in Netlify environment
  const clientSecret = process.env.ClientSecret; // Set in Netlify environment
  const tokenUrl = process.env.TokenURL;         // Set in Netlify environment

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    if (!response.ok) {
      return { statusCode: 500, body: "Failed to get access token" };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ access_token: data.access_token })
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}
