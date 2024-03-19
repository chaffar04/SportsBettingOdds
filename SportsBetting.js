const axios = require("axios");

const API_KEY = "d1e6196116d3f31ed63c1daafe50c9ae";

class Game {
  constructor(league, teams, startTime) {
    this.league = league;
    this.teams = teams;
    this.startTime = startTime;
    this.amount = 100;
    this.betAmounts = [0, 0, 0];
    this.odds = [0, 0, 0];
  }

  getTeamOdds(index) {
    return this.odds[index];
  }

  setTeamOdds(index, value) {
    this.odds[index] = value;
  }

  set2Bookmakers(bookmakers) {
    this.bookmakers = [bookmakers[0], bookmakers[1]];
  }

  set3Bookmakers(bookmakers) {
    this.bookmakers = [bookmakers[0], bookmakers[1], bookmakers[2]];
  }

  calculateBetAmount(game) {
    if (this.odds[2] == 0) {
      this.betAmounts[0] = Number(
        (this.amount / (1 + this.odds[0] / this.odds[1])).toFixed(2)
      );
      this.betAmounts[1] = Number(
        (this.amount - this.betAmounts[0]).toFixed(2)
      );
    } else {
      const totalWeight =
        1 / this.odds[0] + 1 / this.odds[1] + 1 / this.odds[2];
      const calculateBet = (odd) =>
        Number((1 / odd / totalWeight) * this.amount).toFixed(2);
      (this.betAmounts[0] = calculateBet(this.odds[0])),
        (this.betAmounts[1] = calculateBet(this.odds[1])),
        (this.betAmounts[2] = calculateBet(this.odds[2]));
    }
  }

  interestRate() {
    this.calculateBetAmount();
    const profit = this.betAmounts[0] * this.odds[0] - this.amount;
    this.interest = Number(((profit / this.amount) * 100).toFixed(2));
    return this.interest;
  }

  inTimeRange(startTime, now, tomorrow) {
    if (startTime > now && startTime < tomorrow) {
      return true;
    } else {
      return false;
    }
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
      response.data.forEach((game) => {
        const gameOdds = bestOdds(game);
        gameOdds && games.push(gameOdds);
      });
    }
    return games;
  } catch (error) {
    console.error("Error:", error);
  }
}

function bestOdds(game) {
  try {
    team1 = team2 = team3 = 0;
    const gameInfo = game.bookmakers[0].markets[0]; //shortcut
    const titles = [gameInfo.outcomes[0].name, gameInfo.outcomes[1].name];
    const startTime = new Date(game.commence_time);
    let thisGame = new Game(game.sport_title, titles, startTime);
    const now = new Date();
    let endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    game.bookmakers.forEach((bookmaker, index) => {
      if (bookmaker.markets && bookmaker.markets.length > 0) {
        oddsMath(bookmaker, index, game, thisGame);
      }
    });
    if (thisGame.inTimeRange(startTime, now, endOfDay)) {
      return thisGame;
    } else return null;
  } catch {
    return null;
  }
}

function topGames(games) {
  let bestGames = [];
  for (let i = 0; i < 10; i++) {
    bestGames.push(games[i]);
  }
  bestGames.sort((a, b) => a.interestRate() - b.interestRate());

  games.forEach((game) => {
    if (game.interestRate() > bestGames[0].interestRate()) {
      bestGames[0] = game;
      bestGames.sort((a, b) => a.interestRate() - b.interestRate());
    }
  });
  return bestGames;
}

function oddsMath(bookmaker, index, game, thisGame) {
  if (bookmaker.markets[0].outcomes.length < 3) {
    if (bookmaker.markets[0].outcomes[0].price > thisGame.getTeamOdds(0)) {
      team1 = index;
      thisGame.setTeamOdds(0, bookmaker.markets[0].outcomes[0].price);
    }
    if (bookmaker.markets[0].outcomes[1].price > thisGame.getTeamOdds(1)) {
      team2 = index;
      thisGame.setTeamOdds(1, bookmaker.markets[0].outcomes[1].price);
    }
    platforms = [game.bookmakers[team1].title, game.bookmakers[team2].title];
    thisGame.set2Bookmakers(platforms);
  } else {
    if (bookmaker.markets[0].outcomes[0].price > thisGame.getTeamOdds(0)) {
      team1 = index;
      thisGame.setTeamOdds(0, bookmaker.markets[0].outcomes[0].price);
    }
    if (bookmaker.markets[0].outcomes[1].price > thisGame.getTeamOdds(1)) {
      team2 = index;
      thisGame.setTeamOdds(1, bookmaker.markets[0].outcomes[1].price);
    }
    if (bookmaker.markets[0].outcomes[2].price > thisGame.getTeamOdds(2)) {
      team3 = index;
      thisGame.setTeamOdds(2, bookmaker.markets[0].outcomes[2].price);
    }
    platforms = [
      game.bookmakers[team1].title,
      game.bookmakers[team2].title,
      game.bookmakers[team3].title,
    ];
    thisGame.set3Bookmakers(platforms);
  }
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
