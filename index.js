import express from "express"; // use to build a web server easily
import fetch from "node-fetch"; // use to get data from another api
import cors from "cors"; //helps other websites interact with the api

const app = express();//to create the express app
app.use(cors()); 
app.use(express.json());


const PORT = 3000;
const Email = "vensonlala@gmail.com";
const Name = "Stephen Okoro";
const Stack = "Node.js/Express";
const CATFACT_TIMEOUT_MS = 3000;

//to fetch data from catfact url and to enforce timeout if fetching data from url takes too long
function timeoutFetch(url, options = {}, timeoutMs = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

app.get("/me", async (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /me from ${req.ip}`);

  //template for the response the api will return in json
  const result = {
    status: "success",
    user: {
      email: Email,
      name: Name,
      stack: Stack
    },
    timestamp: new Date().toISOString(),
    fact: null
  };
  //error handling 
  try {
    const response = await timeoutFetch("https://catfact.ninja/fact", {}, CATFACT_TIMEOUT_MS);
    if (!response.ok) {
      console.warn("Cat Facts API returned non-OK:", response.status);
      result.fact = "No cat fact available right now — try again later.";
    } else {
      const data = await response.json();
      // catfact.ninja returns JSON like: { fact: "...", length: 123 }
      result.fact = data.fact || "No cat fact found in response.";
    }
  } catch (err) {
    console.error("Error fetching cat fact:", err && err.name ? err.name : err);
    result.fact = "No cat fact available right now — try again later.";
    
  }

  res.setHeader("Content-Type", "application/json"); //enables the api respond in json
  return res.status(200).json(result); //  shows connection was successful and sends respond in json
});

//starting the app server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
