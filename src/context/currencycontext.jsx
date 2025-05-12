import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'UGX');
  const [country, setCountry] = useState(() => localStorage.getItem('country') || 'Uganda');
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, UGX: 3700, RWF: 1300, KES: 130 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState({ latitude: null, longitude: null });

  const EXCHANGE_RATE_API_KEY = '250ca4fa8a355ef1d25027ab';
  const BASE_CURRENCY = 'USD';
  const DEFAULT_SOURCE_CURRENCY = 'UGX';
  const SUPPORTED_CURRENCIES = ['USD', 'UGX', 'RWF', 'KES'];

  // Coordinate ranges for supported countries
  const countryRanges = {
    Uganda: { lat: { min: -1.5, max: 1.5 }, lon: { min: 29.5, max: 35.0 }, currency: 'UGX' },
    Kenya: { lat: { min: -5.0, max: 5.0 }, lon: { min: 33.5, max: 41.0 }, currency: 'KES' },
    Rwanda: { lat: { min: -2.8, max: -1.0 }, lon: { min: 28.8, max: 30.9 }, currency: 'RWF' },
    'United States': { lat: { min: 24.0, max: 49.0 }, lon: { min: -125.0, max: -66.0 }, currency: 'USD' },
  };

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

  // Detect location using GPS and map coordinates to country
  useEffect(() => {
    if (localStorage.getItem('currencyManuallySet') === 'true') {
      setLoading(false);
      return; // Skip geolocation if manually set
    }

    const determineCountryFromCoords = (latitude, longitude) => {
      for (const [country, range] of Object.entries(countryRanges)) {
        if (
          latitude >= range.lat.min &&
          latitude <= range.lat.max &&
          longitude >= range.lon.min &&
          longitude <= range.lon.max
        ) {
          return { country, currency: range.currency };
        }
      }
      return { country: 'Uganda', currency: 'UGX' }; // Default to Uganda
    };

    const handleSuccess = ({ coords: { latitude, longitude } }) => {
      console.log('Geolocation Coordinates:', { latitude, longitude });
      setCoords({ latitude, longitude });

      const { country: userCountry, currency: newCurrency } = determineCountryFromCoords(latitude, longitude);

      setCountry(userCountry);
      setCurrency(newCurrency);
      localStorage.setItem('country', userCountry);
      localStorage.setItem('currency', newCurrency);
      setError(null);
      setLoading(false);
    };

    const handleError = (err) => {
      console.error('Geolocation error:', err.message);
      setError('Geolocation failed or permission denied. Please select your country manually.');
      setCoords({ latitude: null, longitude: null });
      setCountry('Uganda');
      setCurrency('UGX');
      localStorage.setItem('country', 'Uganda');
      localStorage.setItem('currency', 'UGX');
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
    localStorage.removeItem('country');
    localStorage.removeItem('currency');
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