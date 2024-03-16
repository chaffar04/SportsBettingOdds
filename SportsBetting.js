const axios = require("axios");

const API_KEY = "d1e6196116d3f31ed63c1daafe50c9ae";

class Game {
  constructor(league, teams, startTime) {
    this.league = league;
    this.teams = teams;
    this.startTime = startTime;
    this.odds = [0, 0];
  }

  getTeamOdds(index) {
    return this.odds[index];
  }

  setTeamOdds(index, value) {
    this.odds[index] = value;
  }

  setBookmakers(bookmakers) {
    this.bookmakers = [bookmakers[0], bookmakers[1]];
  }

  inTimeRange(startTime, now, tomorrow) {
    if (startTime > now && startTime < tomorrow) {
      return true;
    } else {
      return false;
    }
  }

  interestRate() {
    this.interest = 1 - Math.pow(this.odds[0], -1) - Math.pow(this.odds[1], -1);
    return this.interest;
  }

  calculateBetAmount(amount) {
    const betReturn = amount * (1 + this.interest);
    this.betAmounts = this.odds.map((odd) =>
      Number(betReturn / odd).toFixed(2)
    );
    return this.betAmounts;
  }
}

async function getLeagues(apiKey) {
  try {
    let leagueDict = {};
    const response = await axios.get(
      `https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`
    );
    response.data.forEach((league) => {
      if (!league.has_outrights) {
        leagueDict[league.key] = null;
      }
    });
    return leagueDict;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function getGames(apiKey) {
  try {
    const leagues = await getLeagues(apiKey);
    let games = [];

    for (const leagueKey in leagues) {
      const response = await axios.get(
        `https://api.the-odds-api.com/v4/sports/${leagueKey}/odds/?apiKey=${apiKey}&regions=us&markets=h2h,spreads&oddsFormat=decimal`
      );
      if (
        response.data[0] &&
        response.data[0].bookmakers &&
        response.data[0].bookmakers[0].markets &&
        response.data[0].bookmakers[0].markets[0].outcomes.length < 3
      ) {
        response.data.forEach((game) => {
          if (bestOdds(game)) {
            games.push(bestOdds(game));
          }
        });
      }
    }
    return games;
  } catch (error) {
    console.error("Error:", error);
  }
}

function bestOdds(game) {
  if (game.bookmakers[0]) {
    let team1, team2;
    team1 = team2 = 0;
    const gameInfo = game.bookmakers[0].markets[0]; //shortcut
    const titles = [gameInfo.outcomes[0].name, gameInfo.outcomes[1].name]; // cleaner/shortcut
    const startTime = new Date(game.commence_time);
    let thisGame = new Game(game.sport_title, titles, startTime);
    const now = new Date();
    let endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    game.bookmakers.forEach((bookmaker, index) => {
      if (bookmaker.markets[0].outcomes[0].price > thisGame.getTeamOdds(0)) {
        team1 = index;
        thisGame.setTeamOdds(0, bookmaker.markets[0].outcomes[0].price);
      }
      if (bookmaker.markets[0].outcomes[1].price > thisGame.getTeamOdds(1)) {
        team2 = index;
        thisGame.setTeamOdds(1, bookmaker.markets[0].outcomes[1].price);
      }
    });
    platforms = [game.bookmakers[team1].title, game.bookmakers[team2].title];
    thisGame.setBookmakers(platforms);
    if (thisGame.inTimeRange(startTime, now, endOfDay)) {
      return thisGame;
    } else return null;
  } else return null;
}

function topGames(games) {
  let bestGames = [];
  for (let i = 0; i < 10; i++) {
    bestGames.push(games[i]);
  }
  bestGames.sort((a, b) => a.interestRate() - b.interestRate());

  games.forEach((game) => {
    if (game.interestRate() > bestGames[0].interestRate()) {
      game.calculateBetAmount(100);
      bestGames[0] = game;
      bestGames.sort((a, b) => a.interestRate() - b.interestRate());
    }
  });
  return bestGames;
}

async function main() {
  try {
    const games = await getGames(API_KEY);
    console.log(topGames(games));
    console.log("1");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
