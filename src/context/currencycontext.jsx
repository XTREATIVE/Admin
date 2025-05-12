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
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, UGX: 3700, RWF: 1300, KES: 130 }); // Default rates
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const EXCHANGE_RATE_API_KEY = '250ca4fa8a355ef1d25027ab';
  const BASE_CURRENCY = 'USD'; // For API fetch
  const DEFAULT_SOURCE_CURRENCY = 'UGX'; // Backend prices are in UGX
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
          if (!data.conversion_rates[curr]) console.warn(`No rate for ${curr}, using default: ${rates[curr]}`);
        });
        console.log('Fetched exchange rates:', JSON.stringify(rates, null, 2));
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

  // Detect location using browser GPS and reverse geocode to get country and currency
  useEffect(() => {
    const detectByIP = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch country data`);
        const data = await response.json();
        const userCountry = data.country_name || 'Unknown';

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
        console.error('IP detection error:', err.message);
        setError('Unable to detect location. Using default currency.');
        setCountry('Unknown');
        setCurrency('USD');
        localStorage.setItem('country', 'Unknown');
        localStorage.setItem('currency', 'USD');
      } finally {
        setLoading(false);
      }
    };

    const detectByGPS = () => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported, falling back to IP-based detection');
        detectByIP();
        return;
      }

      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const { latitude, longitude } = coords;
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
            console.error('GPS detection error:', err.message);
            detectByIP();
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error('Geolocation error:', err.message);
          detectByIP();
        },
        { timeout: 5000 }
      );
    };

    if (!localStorage.getItem('currencyManuallySet')) {
      detectByGPS();
    } else {
      setLoading(false);
    }
  }, []);

  // Function to convert price to the current currency
  const convertPrice = (price) => {
    if (!price || isNaN(price) || price <= 0) {
      console.warn(`Invalid price: ${price}`);
      return 0;
    }

    if (!SUPPORTED_CURRENCIES.includes(currency)) {
      console.warn(`Unsupported target currency: ${currency}, defaulting to UGX`);
      setCurrency('UGX');
      return price;
    }

    const sourceRate = exchangeRates[DEFAULT_SOURCE_CURRENCY] || 1;
    const targetRate = exchangeRates[currency] || 1;
    const rate = targetRate / sourceRate;
    const converted = Number((price * rate).toFixed(2));

    console.log(
      `Converting ${price} from ${DEFAULT_SOURCE_CURRENCY} to ${currency}: ` +
      `sourceRate=${sourceRate.toFixed(4)}, targetRate=${targetRate.toFixed(4)}, ` +
      `rate=${rate.toFixed(4)}, result=${converted}`
    );

    return converted;
  };

  // Function to manually set currency
  const setManualCurrency = (newCurrency) => {
    if (SUPPORTED_CURRENCIES.includes(newCurrency)) {
      console.log('Manually setting currency to:', newCurrency);
      setCurrency(newCurrency);
      localStorage.setItem('currency', newCurrency);
      localStorage.setItem('currencyManuallySet', 'true');
      setError(null);
    } else {
      console.error('Unsupported currency:', newCurrency);
      setError(`Unsupported currency: ${newCurrency}`);
    }
  };

  // Function to manually set country
  const setManualCountry = (newCountry) => {
    console.log('Manually setting country to:', newCountry);
    setCountry(newCountry);
    localStorage.setItem('country', newCountry);
    const newCurrency = {
      Uganda: 'UGX',
      Rwanda: 'RWF',
      Kenya: 'KES',
      'United States': 'USD',
      Unknown: 'USD',
    }[newCountry] || 'USD';
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    localStorage.setItem('currencyManuallySet', 'true');
    setError(null);
  };

  // Function to reset to auto-detected currency
  const resetToAutoCurrency = () => {
    console.log('Resetting to auto-detected currency');
    localStorage.removeItem('currencyManuallySet');
    localStorage.removeItem('country');
    setLoading(true);
    setError(null);
    setCurrency('USD');
    setCountry('Unknown');
    // Trigger GPS detection again
    navigator.geolocation && navigator.geolocation.getCurrentPosition(() => window.location.reload());
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        country,
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
