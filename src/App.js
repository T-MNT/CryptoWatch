import axios from 'axios';
import { useEffect, useState } from 'react';
import './app.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faStar as emptyStar } from '@fortawesome/free-regular-svg-icons';
import { faStar as fullStar } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [data, setData] = useState([]);
  const [currency, setCurrency] = useState('');
  const [favs, setFavs] = useState([]);
  const [favsOnly, setFavsOnly] = useState(false);
  const [stable, setStable] = useState(false);
  const [coinsNumber, setCoinsNumber] = useState(100);
  const [sortBy, setSortBy] = useState('Marketcap');

  ///////Recupère la data de l'API//////
  const getData = () => {
    if (currency === '') {
      axios
        .get(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C30d%2C200d%2C1y`
        )
        .then((res) => setData(res.data));
    } else {
      axios
        .get(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C30d%2C200d%2C1y`
        )
        .then((res) => setData(res.data));
    }
  };

  ////Récupère les données lorsque l'utilisateur choisit une autre monnaie////
  useEffect(() => {
    getData();
  }, [currency]);

  ////Relance la fonction d'affichage de l'étoile de favori (pleine ou vide) lorsqu'une crypto
  ///est ajoutée ou supprimée à la liste des favoris
  useEffect(() => {
    favDisplayer();
  }, [favs]);

  ////Trigger favori/////
  const favActive = () => {
    if (favsOnly) {
      setFavsOnly(false);
    } else {
      setFavsOnly(true);
    }
  };
  /////Trigger stablecoins/////
  const stableActive = () => {
    if (stable) {
      setStable(false);
    } else {
      setStable(true);
    }
  };

  ////Attribue au state sortBy le paramètre selon lequel l'utilisateur veut trier les cryptos
  ///(par prix croissant ou décroissant, par marketcap croissant ou décroissant, etc...)
  const sortHandler = (sortParam) => {
    if (sortBy === sortParam) {
      setSortBy('!' + sortParam);
    } else setSortBy(sortParam);
  };

  ///////Attribue à la variable cryptofavs un array des favoris si il y en a//////////
  let cryptoFavs = [];
  if (
    localStorage.getItem('CryptoFavs') &&
    localStorage.getItem('CryptoFavs').length > 0
  ) {
    cryptoFavs = JSON.parse(localStorage.getItem('CryptoFavs'));
  }

  //////Ajoute ou supprime une crypto de la liste des favoris///////
  const addFavorite = (cryptoName) => {
    if (!cryptoFavs.includes(cryptoName)) {
      cryptoFavs.push(cryptoName);
      setFavs(cryptoFavs);
      localStorage.setItem('CryptoFavs', JSON.stringify(cryptoFavs));
    } else {
      let i = cryptoFavs.indexOf(cryptoName);
      cryptoFavs.splice(i, 1);
      setFavs(cryptoFavs);
      localStorage.setItem('CryptoFavs', JSON.stringify(cryptoFavs));
    }
  };

  //////Affiche une étoile vide ou pleine si crypto dans les favoris ou non///////
  const favDisplayer = (cryptoName) => {
    if (
      localStorage.getItem('CryptoFavs') &&
      JSON.parse(localStorage.getItem('CryptoFavs')).includes(cryptoName)
    ) {
      return (
        <FontAwesomeIcon
          icon={fullStar}
          onClick={(e) => addFavorite(cryptoName)}
          style={{ color: 'yellow', marginRight: '20px', cursor: 'pointer' }}
        />
      );
    } else {
      return (
        <FontAwesomeIcon
          icon={emptyStar}
          onClick={(e) => addFavorite(cryptoName)}
          style={{ color: 'yellow', marginRight: '20px', cursor: 'pointer' }}
        />
      );
    }
  };

  /////Attribue à la variable currency le symbole de la monnaie séléctionnée par l'utilisateur//////
  let currencySymbol;
  switch (currency) {
    case '':
      currencySymbol = ' $';
      break;
    case 'usd':
      currencySymbol = ' $';
      break;
    case 'eur':
      currencySymbol = ' €';
      break;
    case 'rub':
      currencySymbol = ' ₽';
      break;
    case 'cny':
      currencySymbol = ' ¥';
      break;

    default:
      break;
  }

  //////Filtre la data brute pour afficher seulement les favoris ou non, avec ou sans les stablecoins//////
  let newData;
  let stableCoins = ['Tether', 'USD Coin', 'Binance USD', 'Dai', 'TrueUSD'];

  if (favsOnly) {
    newData = data.filter((crypto) => cryptoFavs.includes(crypto.name));
  } else {
    newData = data;
  }
  if (stable) {
    newData = newData.filter((crypto) => !stableCoins.includes(crypto.name));
  }
  if (favsOnly === false && stable === false) {
    newData = data;
  }

  //////Affiche les variations de prix en pourcentage sous le format X.XX % ///////
  const percentHandler = (data) => {
    if (data) {
      return (
        data.toString().split('.')[0] +
        '.' +
        data.toString().split('.')[1][0] +
        data.toString().split('.')[1][1] +
        '%'
      );
    }
  };

  /////Gère l'affichage du marketcap/////
  const mkCapHandler = (mkcap) => {
    switch (mkcap.toString().length) {
      case 15:
        return mkcap.toString().substr(0, 6) + ' Mds';
      case 14:
        return mkcap.toString().substr(0, 5) + ' Mds';
      case 13:
        return mkcap.toString().substr(0, 4) + ' Mds';
      case 12:
        return mkcap.toString().substr(0, 3) + ' Mds';
      case 11:
        return mkcap.toString().substr(0, 2) + ' Mds';
      case 10:
        return mkcap.toString().substr(0, 1) + ' Mds';
      case 9:
        return mkcap.toString().substr(0, 3) + ' Ms';
      case 8:
        return mkcap.toString().substr(0, 2) + ' Ms';
      case 7:
        return mkcap.toString().substr(0, 1) + ' Ms';

      default:
        break;
    }
  };

  /////Rend à l'écran la data (favori uniquement ou non, stablecoins affichés ou non)
  /////et trie les cryptos par marketcap,prix et variation de prix dans le temps(1h,24h,etc...)

  const mappedData = newData
    .slice(0, coinsNumber)
    .sort((a, b) => {
      switch (sortBy) {
        case 'Marketcap':
          return b.market_cap - a.market_cap;
        case '!Marketcap':
          return a.market_cap - b.market_cap;
        case 'Price':
          return b.current_price - a.current_price;
        case '!Price':
          return a.current_price - b.current_price;
        case '1h':
          return (
            b.price_change_percentage_1h_in_currency -
            a.price_change_percentage_1h_in_currency
          );
        case '!1h':
          return (
            a.price_change_percentage_1h_in_currency -
            b.price_change_percentage_1h_in_currency
          );
        case '24h':
          return (
            b.price_change_percentage_24h_in_currency -
            a.price_change_percentage_24h_in_currency
          );
        case '!24h':
          return (
            a.price_change_percentage_24h_in_currency -
            b.price_change_percentage_24h_in_currency
          );
        case '7 days':
          return (
            b.price_change_percentage_7d_in_currency -
            a.price_change_percentage_7d_in_currency
          );
        case '!7 days':
          return (
            a.price_change_percentage_7d_in_currency -
            b.price_change_percentage_7d_in_currency
          );
        case '30 days':
          return (
            b.price_change_percentage_30d_in_currency -
            a.price_change_percentage_30d_in_currency
          );
        case '!30 days':
          return (
            a.price_change_percentage_30d_in_currency -
            b.price_change_percentage_30d_in_currency
          );
        case '200 days':
          return (
            b.price_change_percentage_200d_in_currency -
            a.price_change_percentage_200d_in_currency
          );
        case '!200 days':
          return (
            a.price_change_percentage_200d_in_currency -
            b.price_change_percentage_200d_in_currency
          );
        case '1 year':
          return (
            b.price_change_percentage_1y_in_currency -
            a.price_change_percentage_1y_in_currency
          );
        case '!1 year':
          return (
            a.price_change_percentage_1y_in_currency -
            b.price_change_percentage_1y_in_currency
          );
        case 'Ath':
          return b.ath - a.ath;
        case '!Ath':
          return a.ath - b.ath;
        default:
          break;
      }
    })
    .map((crypto, index) => (
      <li className="cryptoLi" key={crypto.id}>
        <div className="coinNameImg">
          {favDisplayer(crypto.name)}
          {index + 1}
          <img src={crypto.image} alt="Currency image" />
          <h2>{crypto.name}</h2>
          <h4 style={{ marginLeft: '15px', color: 'grey' }}>{crypto.symbol}</h4>
        </div>

        <ul className="cryptoData">
          <li>
            {crypto.current_price}
            {currencySymbol}
          </li>
          <li>
            {mkCapHandler(crypto.market_cap)}
            {currencySymbol}
            {console.log(typeof crypto.market_cap)}
          </li>
          <li
            style={{
              color:
                crypto.price_change_percentage_1h_in_currency > 0
                  ? 'green'
                  : 'red',
            }}
          >
            {percentHandler(crypto.price_change_percentage_1h_in_currency)}
          </li>
          <li
            id="1h"
            style={{
              color:
                crypto.price_change_percentage_24h_in_currency > 0
                  ? 'green'
                  : 'red',
            }}
          >
            {percentHandler(crypto.price_change_percentage_24h_in_currency)}
          </li>
          <li
            id="24h"
            style={{
              color:
                crypto.price_change_percentage_7d_in_currency > 0
                  ? 'green'
                  : 'red',
            }}
          >
            {percentHandler(crypto.price_change_percentage_7d_in_currency)}
          </li>
          <li
            id="7d"
            style={{
              color:
                crypto.price_change_percentage_30d_in_currency > 0
                  ? 'green'
                  : 'red',
            }}
          >
            {percentHandler(crypto.price_change_percentage_30d_in_currency)}
          </li>
          <li
            id="7d"
            style={{
              color:
                crypto.price_change_percentage_200d_in_currency > 0
                  ? 'green'
                  : 'red',
            }}
          >
            {percentHandler(crypto.price_change_percentage_200d_in_currency)}
          </li>
          <li
            id="7d"
            style={{
              color:
                crypto.price_change_percentage_1y_in_currency > 0
                  ? 'green'
                  : 'red',
            }}
          >
            {percentHandler(crypto.price_change_percentage_1y_in_currency)}
          </li>
          <li>
            {crypto.ath}
            {currencySymbol}
          </li>
        </ul>
      </li>
    ));

  const propertyList = [
    'Price',
    'Marketcap',
    '1h',
    '24h',
    '7 days',
    '30 days',
    '200 days',
    '1 year',
    'Ath',
  ];

  return (
    <div className="App">
      <header>
        <h1>CoinWatcher</h1>
      </header>
      <div className="main-container">
        <div className="options-container">
          <div className="options">
            <div className="range">
              <label>Top {coinsNumber}</label>
              <input
                type="range"
                min="1"
                max="250"
                value={coinsNumber}
                onChange={(e) => setCoinsNumber(e.target.value)}
              />
            </div>
            <select onChange={(e) => setCurrency(e.target.value)}>
              <option>Choose a currency</option>
              <option value={'usd'}>USD</option>
              <option value={'eur'}>EUR</option>
              <option value={'rub'}>RUB</option>
              <option value={'cny'}>CNY</option>
            </select>
            <button id="fav" onClick={(e) => favActive()}>
              {favsOnly ? 'Show all coins' : 'Show favorites only'}
            </button>
            <button onClick={(e) => stableActive()}>
              {stable ? 'Show stableCoins' : 'Hide stableCoins'}
            </button>
          </div>
        </div>

        <main>
          <div className="table">
            <ul className="property">
              <li>Coin</li>
              {propertyList.map((property) => (
                <li
                  onClick={(e) => sortHandler(`${property}`)}
                  className={
                    sortBy === property
                      ? 'active'
                      : '' || sortBy === '!' + property
                      ? 'activeReverse'
                      : ''
                  }
                >
                  {property}
                </li>
              ))}
            </ul>
            <ul className="cryptoList">{mappedData}</ul>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
