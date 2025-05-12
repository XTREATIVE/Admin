import React, { useState, useEffect, useMemo, useContext } from "react";
import Slider from "@mui/material/Slider";
import "../styles/index.css";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import ProductSection from "./product_section";
import Loader from "../pages/Loader";
import { CurrencyContext } from "../context/currencycontext";

const API_URL = "https://api-xtreative.onrender.com/products/listing/";

const FilterAndCard = () => {
  const { currency, loading: loadingCurrency, error: errorCurrency } = useContext(CurrencyContext);

  // Toggle states for filter sections
  const [openCategory, setOpenCategory] = useState(true);
  const [openPrice, setOpenPrice] = useState(false);
  const [openSize, setOpenSize] = useState(false);
  const [openRating, setOpenRating] = useState(false);

  // Filter controls state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(["All Categories"]);
  const [selectedSizes, setSelectedSizes] = useState(["All Sizes"]);
  const [selectedRating, setSelectedRating] = useState(null);

  // Price range boundaries
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 1500]);
  const [selectedPriceOption, setSelectedPriceOption] = useState("all");

  // Static rating options for the UI
  const ratingOptions = [
    { stars: 1, count: 437 },
    { stars: 2, count: 657 },
    { stars: 3, count: 1897 },
    { stars: 4, count: 3571 },
  ];

  // Fetched products + loading/error
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Snapshot of applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    minPrice: 0,
    maxPrice: 1500,
    selectedCategories: ["All Categories"],
    selectedRating: null,
    selectedSizes: ["All Sizes"],
  });

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Sort newest first
        data.sort((a, b) => b.id - a.id);
        setAllProducts(data);

        // Compute price bounds
        const prices = data.map((p) => Number(p.price));
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setMinPrice(min);
        setMaxPrice(max);
        setSelectedPriceRange([min, max]);
        setSelectedPriceOption("all");
        setAppliedFilters((prev) => ({
          ...prev,
          minPrice: min,
          maxPrice: max,
        }));

        setFetchError(null);
      } catch (err) {
        console.error(err);
        setFetchError("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Dynamic filter lists
  const dynamicCategoryList = useMemo(
    () => [
      "All Categories",
      ...Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean))),
    ],
    [allProducts]
  );

  const dynamicPriceOptions = useMemo(() => {
    if (minPrice === maxPrice) {
      return [
        {
          label: `${currency} ${minPrice} - ${currency} ${maxPrice}`,
          value: `${minPrice}-${maxPrice}`,
          count: allProducts.length,
        },
      ];
    }
    const ranges = 4;
    const step = (maxPrice - minPrice) / ranges;
    const opts = Array.from({ length: ranges }, (_, i) => {
      const low = Math.round(minPrice + i * step);
      const high =
        i === ranges - 1 ? maxPrice : Math.round(minPrice + (i + 1) * step);
      const cnt = allProducts.filter(
        (p) =>
          Number(p.price) >= low &&
          Number(p.price) < (i === ranges - 1 ? high + 1 : high)
      ).length;
      return {
        label: `${currency} ${low} - ${currency} ${high}`,
        value: `${low}-${high}`,
        count: cnt,
      };
    });
    return [
      { label: "All Price", value: "all", count: allProducts.length },
      ...opts,
    ];
  }, [minPrice, maxPrice, allProducts, currency]);

  const dynamicSizeOptions = useMemo(() => {
    const counts = allProducts.reduce((acc, p) => {
      if (p.size) acc[p.size] = (acc[p.size] || 0) + 1;
      return acc;
    }, {});
    const order = ["S", "M", "L", "XL", "XXL", "Others"];
    const ordered = order.filter((s) => counts[s]).map((s) => `${s} (${counts[s]})`);
    const extra = Object.keys(counts)
      .filter((s) => !order.includes(s))
      .map((s) => `${s} (${counts[s]})`);
    return ["All Sizes", ...ordered, ...extra];
  }, [allProducts]);

  // Handlers
  const handleCategoryChange = (cat, checked) => {
    if (cat === "All Categories") {
      setSelectedCategories(checked ? ["All Categories"] : []);
    } else {
      let sel = selectedCategories.filter((c) => c !== "All Categories");
      if (checked) sel.push(cat);
      else sel = sel.filter((c) => c !== cat);
      if (!sel.length) sel = ["All Categories"];
      setSelectedCategories(sel);
    }
  };

  const handleSizeChange = (szOpt, checked) => {
    const sz = szOpt.split(" ")[0];
    if (sz === "All") {
      setSelectedSizes(checked ? ["All Sizes"] : []);
    } else {
      let sel = selectedSizes.filter((s) => s !== "All Sizes");
      if (checked) sel.push(sz);
      else sel = sel.filter((s) => s !== sz);
      if (!sel.length) sel = ["All Sizes"];
      setSelectedSizes(sel);
    }
  };

  const handlePriceOptionChange = (val) => {
    if (selectedPriceOption === val) {
      setSelectedPriceOption("all");
      setSelectedPriceRange([minPrice, maxPrice]);
    } else {
      setSelectedPriceOption(val);
      if (val !== "all") {
        const [lo, hi] = val.split("-").map(Number);
        setSelectedPriceRange([lo, hi]);
      } else {
        setSelectedPriceRange([minPrice, maxPrice]);
      }
    }
  };

  const handleSliderChange = (_, range) => {
    setSelectedPriceRange(range);
    setSelectedPriceOption("custom");
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      searchTerm,
      minPrice: selectedPriceRange[0],
      maxPrice: selectedPriceRange[1],
      selectedCategories,
      selectedRating,
      selectedSizes,
    });
  };

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedFilters((prev) => ({ ...prev, searchTerm }));
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleApplyFilters();
  };

  // Combine loading and error states
  if (loadingCurrency || loadingProducts) {
    return <Loader />;
  }
  if (errorCurrency || fetchError) {
    return (
      <div className="p-4 text-center text-red-600">
        {fetchError && <p>{fetchError}</p>}
        {errorCurrency && <p>Currency error: {errorCurrency}</p>}
      </div>
    );
  }

  return (
    <div className="flex w-full gap-4">
      {/* Left Filter Panel */}
      <div className="w-1/4 p-4">
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="block w-full p-1 pl-8 pr-4 text-[11px] border border-gray-300 rounded focus:outline-none focus:border-black"
              placeholder="Search..."
            />
            <svg
              className="absolute left-2 top-2 w-2.5 h-2.5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.386a1 1 0 01-1.414 1.415l-3.387-3.387zM8 14a6 6 0 100-12 6 6 0 000 12z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Categories */}
          <div>
            <button
              onClick={() => setOpenCategory(!openCategory)}
              className="w-full flex items-center justify-between bg-blue-50 p-2 rounded text-[11px] text-gray-700"
            >
              Categories {openCategory ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
            {openCategory && (
              <div className="mt-2 space-y-2 text-[11px] text-gray-700">
                {dynamicCategoryList.map((cat) => (
                  <label key={cat} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox accent-[#f9622c] w-2.5 h-2.5"
                      checked={selectedCategories.includes(cat)}
                      onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div>
            <button
              onClick={() => setOpenPrice(!openPrice)}
              className="w-full flex items-center justify-between bg-blue-50 p-2 rounded text-[11px] text-gray-600"
            >
              Product Price {openPrice ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
            {openPrice && (
              <div className="mt-2 space-y-2 text-[10px] text-gray-700">
                {dynamicPriceOptions.map(({ label, value, count }) => (
                  <label key={value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox accent-[#f9622c] w-2.5 h-2.5"
                      checked={selectedPriceOption === value}
                      onChange={() => handlePriceOptionChange(value)}
                    />
                    <span>{label} ({count})</span>
                  </label>
                ))}
                <p className="text-[11px] font-medium text-gray-700 mb-1">
                  Custom Price Range:
                </p>
                <Slider
                  value={selectedPriceRange}
                  onChange={handleSliderChange}
                  min={minPrice}
                  max={maxPrice}
                  step={50}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${currency} ${value}`}
                  sx={{
                    color: "#f9622c",
                    height: 4,
                    "& .MuiSlider-thumb": { width: 14, height: 14 },
                    "& .MuiSlider-track": { height: 4 },
                    "& .MuiSlider-rail": { height: 4, color: "#ccc" },
                  }}
                />
                <div className="flex items-center space-x-2 mt-2 text-[11px] text-gray-600">
                  <div className="flex-1 flex items-center border rounded p-2">
                    <span className="mr-1">{currency}</span>
                    <input
                      type="number"
                      value={selectedPriceRange[0]}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (v >= minPrice && v <= selectedPriceRange[1]) {
                          setSelectedPriceRange([v, selectedPriceRange[1]]);
                          setSelectedPriceOption("custom");
                        }
                      }}
                      className="w-full outline-none text-[11px]"
                    />
                  </div>
                  <span>to</span>
                  <div className="flex-1 flex items-center border rounded p-2">
                    <span className="mr-1">{currency}</span>
                    <input
                      type="number"
                      value={selectedPriceRange[1]}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (v <= maxPrice && v >= selectedPriceRange[0]) {
                          setSelectedPriceRange([selectedPriceRange[0], v]);
                          setSelectedPriceOption("custom");
                        }
                      }}
                      className="w-full outline-none text-[11px]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Size & Fit */}
          <div>
           
            <button
              onClick={() => setOpenSize(!openSize)}
              className="w-full flex items-center justify-between bg-blue-50 p-2 rounded text-[11px] text-gray-600"
            >
              Size & Fit {openSize ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
            {openSize && (
              <div className="mt-2 ml-2 space-y-1 text-[10px] text-gray-600">
                {dynamicSizeOptions.map((sz) => (
                  <label key={sz} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox accent-[#f9622c] w-2.5 h-2.5"
                      checked={
                        sz.startsWith("All")
                          ? selectedSizes.includes("All Sizes")
                          : selectedSizes.includes(sz.split(" ")[0])
                      }
                      onChange={(e) => handleSizeChange(sz, e.target.checked)}
                    />
                    <span>{sz}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Rating */}
          <div>
            <button
              onClick={() => setOpenRating(!openRating)}
              className="w-full flex items-center justify-between bg-blue-50 p-2 rounded text-[11px] text-gray-600"
            >
              Rating {openRating ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
            {openRating && (
              <div className="mt-2 ml-2 space-y-2 text-[11px] text-gray-600">
                {ratingOptions.map(({ stars, count }) => (
                  <label key={stars} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="rating"
                      className="form-radio accent-[#f9622c] w-3 h-3"
                      checked={selectedRating === stars}
                      onChange={() => setSelectedRating(stars)}
                    />
                    <span className="flex items-center">
                      {Array.from({ length: stars }).map((_, i) => (
                        <FaStar key={i} size={11} color="#FFC107" />
                      ))}{" "}
                      & Above ({count})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Apply Filters */}
          <button
            onClick={handleApplyFilters}
            className="w-full bg-[#f9622c] hover:bg-orange-600 text-white py-2 rounded text-[11px] font-semibold"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Right Side (Products display area) */}
      <div className="w-3/4 p-4">
        <div className="bg-white shadow-md rounded-lg p-6">
          <ProductSection
            products={allProducts}
            filters={appliedFilters}
            loading={false}
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterAndCard;