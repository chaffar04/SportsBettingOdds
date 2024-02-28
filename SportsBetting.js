const axios = require("axios");

const API_KEY = "ae91e974d42ed39b3993d3eed96cbf8e";

async function getLeagues(apiKey) {
  try {
    let leagueDict = {};
    const response = await axios.get(
      `https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`
    );
    response.data.forEach((league) => {
      leagueDict[league.key] = null;
    });
    return leagueDict;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function getGames(apiKey) {
  try {
    const leagues = await getLeagues(apiKey);

    for (const leagueKey in leagues) {
      const response = await axios.get(
        `https://api.the-odds-api.com/v4/sports/${leagueKey}/odds/?apiKey=${apiKey}&regions=us&markets=h2h`
      );
      response.date.forEach((game) => {});
      console.log(response.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

function getGameDetails(game) {
  bookmaker = league = game.sport_title;
}

function decimalOdd(odds) {
  if (odds.length < 3) {
    return 1 - Math.pow(odds[0], -1) - Math.pow(odds[1], -1);
  } else {
    //draw
  }
}

function drawDecimalOdd(odd) {}

class Game {
  constructor(bookmaker, league, teams, odds) {
    this.bookmaker = bookmaker;
    this.league = league;
    this.teams = teams;
    this.odds = odds;
  }

  interestRate() {
    let temp;
    if (this.odds.length < 3) {
      odds.forEach((odd) => {
        temp += decimalOdd(odd);
      });
      return 1 - temp;
    } else {
    }
  }
}

getGames(API_KEY);
