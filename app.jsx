import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const App = () => {
  const [allProducts, setAllProducts] = useState([]); // 原始數據
  const [filteredProducts, setFilteredProducts] = useState([]); // 過濾後的數據
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  
  // 分類與分頁狀態
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const loadData = async () => {
      try {
        // 直接使用檔名 fetch。在你的本地環境 (localhost) 這樣寫就能正確讀取到資料。
        // 移除了 new URL() 避免在特殊的預覽環境 (如 blob URL) 中引發 Invalid URL 錯誤。
        const response = await fetch('products.json');
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();

        // 邏輯處理：
        // 1. 過濾掉標記為 SOLD OUT 的貨品
        // 2. 確保商品有尺寸資訊 (sizes 陣列不為空)
        const availableProducts = data.filter(p => 
          p.status !== 'SOLD OUT' && 
          Array.isArray(p.sizes) && 
          p.sizes.length > 0
        );
        
        setAllProducts(availableProducts);
        setFilteredProducts(availableProducts);
        setLoading(false);
      } catch (err) {
        console.warn("無法載入 products.json (如果您在預覽環境中查看，這是正常的):", err);
        
        // 錯誤處理機制：如果抓不到 JSON (例如在網頁預覽器中)，自動提供一些展示用的假資料，
        // 這樣就不會讓整個網頁卡在「正在掃描...」的畫面或崩潰。
        const fallbackProducts = [
          {
            name: "NIKE AIR MAX PLUS (預覽展示)",
            brand: "Nike",
            original_price: 1399,
            my_price: 899,
            image: "https://via.placeholder.com/400x533?text=Nike+Air+Max",
            status: "AVAILABLE",
            sizes: ["40", "41", "42", "42.5", "43"]
          },
          {
            name: "NEW BALANCE 990V6 (預覽展示)",
            brand: "New Balance",
            original_price: 1899,
            my_price: 1499,
            image: "https://via.placeholder.com/400x533?text=NB+990V6",
            status: "AVAILABLE",
            sizes: ["39", "40", "44"]
          }
        ];
        
        setAllProducts(fallbackProducts);
        setFilteredProducts(fallbackProducts);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 當品牌選擇改變時，重置分頁並過濾
  useEffect(() => {
    let result = allProducts;
    if (selectedBrand !== 'All') {
      result = allProducts.filter(p => p.brand === selectedBrand);
    }
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [selectedBrand, allProducts]);

  // 獲取所有不重複的品牌清單
  const brands = ['All', ...new Set(allProducts.map(p => p.brand).filter(Boolean))];

  // 計算分頁數據
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* 頂部通知欄 */}
      <div className="bg-black text-white text-center py-2 text-[10px] font-bold tracking-[0.2em] uppercase">
        Global Shipping • 100% Authentic Guaranteed • European Boutique Stock
      </div>

      {/* 導覽列 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tighter italic cursor-pointer" onClick={() => setSelectedBrand('All')}>
            EXCLSV_SELECT
          </h1>
          
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer">
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 頁首摘要 */}
      <header className="bg-white border-b border-neutral-100 py-10 px-4 text-center">
        <h2 className="text-3xl font-black mb-2 uppercase tracking-tight italic">Outlet Inventory</h2>
        <p className="text-neutral-500 text-xs max-w-md mx-auto leading-relaxed">
          即時同步歐洲買手店特價庫存。系統已自動隱藏缺貨商品。<br/>
          價格已包含國際運費與代購服務費。
        </p>
      </header>

      {/* 品牌篩選器 */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-neutral-400">
          <Filter size={12} /> Filter By Brand
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
          {brands.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all ${
                selectedBrand === brand 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-neutral-500 border-neutral-200 hover:border-black'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* 產品列表 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <RefreshCw className="animate-spin mb-4" size={32} />
            <p className="text-sm font-medium">正在掃描歐洲現貨數據庫...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">
            <p className="text-sm">目前沒有符合條件的商品。</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
              {currentItems.map((product, index) => (
                <div key={index} className="group flex flex-col h-full">
                  <div className="aspect-[3/4] overflow-hidden bg-neutral-100 rounded-sm mb-3 relative">
                    <img 
                      src={product.image || 'https://via.placeholder.com/400x533?text=Coming+Soon'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-1 italic uppercase">
                      Sale
                    </div>
                  </div>
                  
                  <div className="space-y-1 flex-grow">
                    <div className="text-[9px] font-black text-orange-600 uppercase tracking-widest">{product.brand || 'Premium'}</div>
                    <h3 className="font-bold text-[11px] leading-tight h-8 overflow-hidden line-clamp-2 uppercase tracking-tighter">
                      {product.name}
                    </h3>
                    
                    {/* 剩餘尺寸顯示 */}
                    <div className="pt-2">
                      <div className="text-[8px] font-bold text-neutral-400 uppercase mb-1">Available Sizes</div>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes && product.sizes.slice(0, 6).map(size => (
                          <span key={size} className="text-[9px] border border-neutral-200 px-1.5 py-0.5 rounded-sm font-mono bg-white">
                            {size}
                          </span>
                        ))}
                        {product.sizes?.length > 6 && <span className="text-[8px] text-neutral-400 flex items-center">+{product.sizes.length - 6}</span>}
                      </div>
                    </div>

                    <div className="pt-3 flex flex-col">
                      <span className="text-sm font-black">HK$ {product.my_price}</span>
                      <span className="text-[9px] text-neutral-400 line-through">
                        MKT: HK$ {product.original_price}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full mt-4 py-3 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap size={10} fill="currentColor" />
                    Secure Checkout
                  </button>
                </div>
              ))}
            </div>

            {/* 分頁控制項 */}
            {totalPages > 1 && (
              <div className="mt-16 flex flex-col items-center gap-4 border-t border-neutral-200 pt-10">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Page {currentPage} of {totalPages} ({filteredProducts.length} items)
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="p-2 border border-neutral-200 rounded-sm disabled:opacity-30 hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-none">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      // 僅顯示目前頁面附近的頁碼以節省空間
                      if (
                        pageNum === 1 || 
                        pageNum === totalPages || 
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`min-w-[32px] h-8 text-[10px] font-bold border transition-colors ${
                              currentPage === pageNum 
                              ? 'bg-black text-white border-black' 
                              : 'bg-white border-neutral-200 text-neutral-500'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return <span key={pageNum} className="text-neutral-300">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button 
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-neutral-200 rounded-sm disabled:opacity-30 hover:bg-white transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-neutral-200 mt-20 py-12 text-center">
        <p className="text-[9px] text-neutral-400 uppercase tracking-[0.3em] leading-loose">
          © 2024 EXCLUSIVE SELECT HK<br/>
          Authenticated by Expert Curators • Daily Inventory Sync
        </p>
      </footer>
    </div>
  );
};

export default App;