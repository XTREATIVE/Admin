import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create the Currency Context
export const CurrencyContext = createContext();

// Currency Provider Component
export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'USD';
  });
  const [country, setCountry] = useState(() => {
    return localStorage.getItem('country') || 'Unknown';
  });
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, UGX: 3700, RWF: 1300, KES: 130 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add GPS coordinates
  const [coords, setCoords] = useState({ latitude: null, longitude: null });

  const EXCHANGE_RATE_API_KEY = '250ca4fa8a355ef1d25027ab';
  const BASE_CURRENCY = 'USD';
  const DEFAULT_SOURCE_CURRENCY = 'UGX';
  const SUPPORTED_CURRENCIES = ['USD', 'UGX', 'RWF', 'KES'];

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${BASE_CURRENCY}`
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch exchange rates`);
        const data = await response.json();
        if (!data.conversion_rates) throw new Error('Invalid API response: No conversion rates found');

        const rates = {};
        SUPPORTED_CURRENCIES.forEach((curr) => {
          rates[curr] = data.conversion_rates[curr] || exchangeRates[curr] || 1;
        });
        setExchangeRates(rates);
        setError(null);
      } catch (err) {
        console.error('Exchange rate error:', err.message);
        setError('Unable to fetch exchange rates. Using default rates.');
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  // Detect location using GPS only, set coords & country/currency
  useEffect(() => {
    const handleSuccess = async ({ coords: { latitude, longitude } }) => {
      setCoords({ latitude, longitude });
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const userCountry = data.countryName || 'Unknown';

        setCountry(userCountry);
        localStorage.setItem('country', userCountry);

        let newCurrency = 'USD';
        if (userCountry === 'Uganda') newCurrency = 'UGX';
        else if (userCountry === 'Rwanda') newCurrency = 'RWF';
        else if (userCountry === 'Kenya') newCurrency = 'KES';

        setCurrency(newCurrency);
        localStorage.setItem('currency', newCurrency);
        setError(null);
      } catch (err) {
        console.error('GPS reverse-geocode error:', err.message);
        setError('Unable to determine country from GPS. Using defaults.');
        setCountry('Unknown');
        setCurrency('USD');
        localStorage.setItem('country', 'Unknown');
        localStorage.setItem('currency', 'USD');
      } finally {
        setLoading(false);
      }
    };

    const handleError = (err) => {
      console.error('Geolocation error:', err.message);
      setError('Geolocation failed or permission denied. Using defaults.');
      setCoords({ latitude: null, longitude: null });
      setCountry('Unknown');
      setCurrency('USD');
      localStorage.setItem('country', 'Unknown');
      localStorage.setItem('currency', 'USD');
      setLoading(false);
    };

    if (!navigator.geolocation) {
      handleError(new Error('Geolocation not supported'));
    } else {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, { timeout: 5000 });
    }
  }, []);

  // Convert price
  const convertPrice = (price) => {
    if (!price || isNaN(price) || price <= 0) return 0;
    const sourceRate = exchangeRates[DEFAULT_SOURCE_CURRENCY] || 1;
    const targetRate = exchangeRates[currency] || 1;
    return Number((price * (targetRate / sourceRate)).toFixed(2));
  };

  // Manual overrides
  const setManualCurrency = (newCurrency) => {
    if (SUPPORTED_CURRENCIES.includes(newCurrency)) {
      setCurrency(newCurrency);
      localStorage.setItem('currency', newCurrency);
      localStorage.setItem('currencyManuallySet', 'true');
      setError(null);
    } else {
      setError(`Unsupported currency: ${newCurrency}`);
    }
  };

  const setManualCountry = (newCountry) => {
    setCountry(newCountry);
    localStorage.setItem('country', newCountry);
    const newCurrency = { Uganda: 'UGX', Rwanda: 'RWF', Kenya: 'KES', 'United States': 'USD' }[newCountry] || 'USD';
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    localStorage.setItem('currencyManuallySet', 'true');
    setError(null);
  };

  const resetToAutoCurrency = () => {
    localStorage.removeItem('currencyManuallySet');
    setLoading(true);
    window.location.reload();
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        country,
        coords,
        exchangeRates,
        convertPrice,
        loading,
        error,
        setManualCurrency,
        setManualCountry,
        resetToAutoCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

CurrencyProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
