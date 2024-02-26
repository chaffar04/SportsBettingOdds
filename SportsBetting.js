const axios = require("axios");

async function fetchData() {
  const API_KEY = "ae91e974d42ed39b3993d3eed96cbf8e";

  try {
    const response = await axios.get(
      `https://api.the-odds-api.com/v4/sports/basketball_ncaab/odds/?apiKey=${API_KEY}&regions=us,us2,uk,au,eu&markets=h2h`
    );
    console.log(response.data);
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchData();
