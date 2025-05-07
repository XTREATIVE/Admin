import React, { useState, useContext } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaStar, FaSyncAlt } from "react-icons/fa";
import { ProductsContext } from "../context/allproductscontext";
import { ProductContext } from "../context/productcontext";
import Loader from "../pages/Loader";
import { slugify } from "../utils/slugify";

const OFFSET = 10000;
const ITEMS_PER_PAGE = 12;
const TABS = [
  { key: "products", label: "Products" },
  { key: "details", label: "Product Details" },
];

export default function ProductReports() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const { loading: loadingProducts, products } = useContext(ProductsContext);
  const { selectedProduct, setSelectedProduct } = useContext(ProductContext);

  // Pagination for products grid
  const [perPage, setPerPage] = useState(ITEMS_PER_PAGE);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(products.length / perPage);
  const paged = products.slice((page - 1) * perPage, page * perPage);

  if (loadingProducts) return <Loader />;

  const renderProducts = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">Products ({products.length})</div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="text-[11px]">Entries per page:</span>
            <select value={perPage} onChange={e => { setPerPage(+e.target.value); setPage(1); }} className="border px-2 py-1 text-[11px]">
              {[12, 24, 36].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button onClick={() => setPage(1)} className="text-[11px] hover:text-orange-600 flex items-center"><span>Refresh</span><FaSyncAlt className="ml-1"/></button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paged.map(p => (
          <div key={p.id} className="relative bg-white p-2 rounded-lg hover:shadow-lg cursor-pointer" onClick={() => { setSelectedProduct(p); setActiveTab("details"); }}>
            <img src={p.product_image_url || p.product_image} alt={p.name} className="object-contain w-full h-32 mb-2" />
            <h3 className="text-[10px] line-clamp-2">{p.name}</h3>
            <div className="flex items-center text-[10px]">
              <FaStar className="text-yellow-400 mr-1" size={12}/> {p.rating || 0} ({p.reviews || 0})
            </div>
            <div className="text-[11px] font-semibold">UGX {p.price.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6 space-x-2">
        <button onClick={() => setPage(old => Math.max(1, old-1))} disabled={page===1} className="px-2 py-1 border rounded disabled:opacity-50 text-[11px]">Prev</button>
        {[...Array(totalPages)].map((_, i) => (
          <button key={i} onClick={() => setPage(i+1)} className={`px-2 py-1 border rounded text-[11px] ${page===i+1?"bg-orange-500 text-white":""}`}>{i+1}</button>
        ))}
        <button onClick={() => setPage(old => Math.min(totalPages, old+1))} disabled={page===totalPages} className="px-2 py-1 border rounded disabled:opacity-50 text-[11px]">Next</button>
      </div>
    </>
  );

  const renderDetails = () => {
    const p = selectedProduct;
    if (!p) return <div className="text-[11px]">Select a product above to view details.</div>;
    return (
      <div className="bg-white p-4 rounded space-y-4 text-[11px]">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{p.name}</h2>
          <button onClick={() => setActiveTab("products")} className="text-sm text-gray-600">Back to list</button>
        </div>
        <img src={p.product_image_url || p.product_image} alt={p.name} className="w-full h-48 object-contain rounded" />
        <div><strong>Price:</strong> UGX {p.price.toLocaleString()}</div>
        <div><strong>Quantity:</strong> {p.quantity}</div>
        <div><strong>Description:</strong> {p.description}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex bg-gray-50 border-b text-[11px]">
        {TABS.map(tab => (
          <div key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2 text-center cursor-pointer ${activeTab===tab.key?"bg-white border-t border-l border-r text-gray-800":"text-gray-600 hover:text-gray-800"}`}>{tab.label}</div>
        ))}
      </div>
      <div className="p-6 flex-1 overflow-auto">
        {activeTab === "products" ? renderProducts() : renderDetails()}
      </div>
    </div>
  );
}
