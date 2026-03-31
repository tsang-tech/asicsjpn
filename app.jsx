import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, ShoppingBag, AlertCircle } from 'lucide-react';

const ITEMS_PER_PAGE = 50;

// 預覽環境的備用測試資料
const MOCK_DATA = [
  {
    "brand": "JORDAN",
    "product_name": "Retro High OG 'Royal Reimagined'",
    "original_market_price": 1599,
    "your_selling_price": 1159,
    "image_url": "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=533&fit=crop",
    "sizes": ["US 8", "US 9", "US 10"]
  },
  {
    "brand": "STUSSY",
    "product_name": "Basic Stussy Logo Tee",
    "original_market_price": 450,
    "your_selling_price": 320,
    "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=533&fit=crop",
    "sizes": ["S", "M", "L", "XL"]
  },
  {
    "brand": "NIKE",
    "product_name": "Air Force 1 '07 Premium",
    "original_market_price": 899,
    "your_selling_price": 699,
    "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=533&fit=crop",
    "sizes": ["US 7", "US 8", "US 8.5"]
  }
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockData, setIsMockData] = useState(false);

  // 篩選與分頁狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortOption, setSortOption] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);

  // 初始化載入資料
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/products.json');
        if (!response.ok) throw new Error('File not found');
        const data = await response.json();
        
        // 過濾無效資料
        const validData = data.filter(p => 
          p.product_name && 
          p.product_name !== 'Unknown Item' && 
          p.your_selling_price > 0
        );
        setProducts(validData);
      } catch (err) {
        console.warn('載入真實資料失敗，啟用測試資料。', err);
        setIsMockData(true);
        setProducts(MOCK_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 計算品牌列表與數量
  const brands = useMemo(() => {
    const counts = {};
    products.forEach(p => {
      if (!p.brand) return;
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });

    const sortedBrands = Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 30); // 取前 30 大品牌

    return [{ name: 'All', count: products.length }, ...sortedBrands.map(b => ({ name: b, count: counts[b] }))];
  }, [products]);

  // 處理過濾與排序 (利用 useMemo 提升效能)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. 品牌篩選
    if (selectedBrand !== 'All') {
      result = result.filter(p => p.brand === selectedBrand);
    }

    // 2. 關鍵字搜尋
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.product_name && p.product_name.toLowerCase().includes(q)) || 
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    // 3. 排序
    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.your_selling_price - b.your_selling_price);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.your_selling_price - a.your_selling_price);
    }

    return result;
  }, [products, selectedBrand, searchQuery, sortOption]);

  // 分頁計算
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // 當篩選條件改變時，回到第一頁
  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchQuery, selectedBrand, sortOption]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9f9] text-neutral-400">
        <div className="w-10 h-10 border-4 border-neutral-200 border-t-black rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">載入庫存中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1a1a] font-sans selection:bg-black selection:text-white">
      {/* 預覽模式提示 */}
      {isMockData && (
        <div className="bg-red-600 text-white text-center py-2 text-[11px] font-bold tracking-widest uppercase shadow-md flex items-center justify-center gap-2">
          <AlertCircle size={14} />
          AI 預覽模式已啟用測試資料。本地端執行時將自動讀取真實的 products.json
        </div>
      )}

      {/* 頂部跑馬燈 */}
      <div className="bg-black text-white py-2 overflow-hidden whitespace-nowrap">
        <div className="animate-[marquee_30s_linear_infinite] inline-block text-[10px] font-bold tracking-[0.2em] uppercase">
          &nbsp; GLOBAL SHIPPING • 100% AUTHENTIC GUARANTEED • DIRECT FROM EUROPEAN BOUTIQUES • NEW ITEMS ADDED DAILY • GLOBAL SHIPPING • 100% AUTHENTIC GUARANTEED • DIRECT FROM EUROPEAN BOUTIQUES • &nbsp;
        </div>
      </div>

      {/* 導覽列 */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 
            className="text-2xl font-black italic tracking-tighter cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => { setSelectedBrand('All'); setSearchQuery(''); }}
          >
            EXCLSV_SELECT
          </h1>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-[10px] font-black text-red-600 border-2 border-red-600 px-2 py-0.5 italic">
              OUTLET LIVE
            </span>
            <button className="relative cursor-pointer hover:opacity-70 transition-opacity">
              <ShoppingBag size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* 標題與統計 */}
        <div className="mb-8">
          <h2 className="text-4xl font-black uppercase tracking-tight italic leading-none mb-2">Mega Sale</h2>
          <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest italic">
            {filteredProducts.length} ITEMS MATCH YOUR SEARCH
          </p>
        </div>

        {/* 搜尋與排序工具列 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="搜尋品牌或單品 (例如 Nike, Jacket)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm font-bold border border-neutral-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-[#f9f9f9]"
            />
            <Search className="absolute left-3.5 top-3 text-neutral-400" size={16} strokeWidth={3} />
          </div>
          
          <div className="relative w-full md:w-auto">
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full md:w-auto text-sm font-bold border border-neutral-200 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none bg-[#f9f9f9] cursor-pointer text-neutral-600"
            >
              <option value="default">排序: 推薦</option>
              <option value="price-asc">價格: 由低到高</option>
              <option value="price-desc">價格: 由高到低</option>
            </select>
            <ChevronDown className="absolute right-3 top-3.5 text-neutral-400 pointer-events-none" size={14} strokeWidth={3} />
          </div>
        </div>

        {/* 品牌篩選器 */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
            <div className="w-8 h-[1px] bg-neutral-300"></div>
            熱門品牌
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {brands.map((brand) => (
              <button 
                key={brand.name}
                onClick={() => setSelectedBrand(brand.name)}
                className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full border-2 whitespace-nowrap transition-all
                  ${selectedBrand === brand.name 
                    ? 'bg-black text-white border-black shadow-lg scale-105' 
                    : 'bg-white text-neutral-400 border-neutral-100 hover:border-black hover:text-black'}`}
              >
                {brand.name} {brand.name !== 'All' && <span className="opacity-50 ml-1">({brand.count})</span>}
              </button>
            ))}
          </div>
        </div>
        
        {/* 商品網格 */}
        {currentItems.length === 0 ? (
          <div className="col-span-full py-20 text-center text-neutral-400 font-bold uppercase tracking-widest flex flex-col items-center">
            <AlertCircle className="w-12 h-12 mb-4 opacity-20" size={48} strokeWidth={2} />
            找不到符合條件的商品
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-12">
            {currentItems.map((p, idx) => (
              <div key={idx} className="group flex flex-col h-full bg-white rounded-xl p-3 border border-transparent hover:border-neutral-200 transition-all hover:shadow-xl">
                <div className="aspect-[3/4] overflow-hidden bg-[#f4f4f4] rounded-lg mb-4 relative">
                  <img 
                    src={p.image_url || 'https://via.placeholder.com/400x533?text=IMAGE'} 
                    alt={p.product_name}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x533?text=NOT+FOUND' }}
                  />
                  
                  {p.original_market_price > p.your_selling_price && (
                    <div className="bg-gradient-to-tr from-red-500 to-red-700 absolute top-2 left-2 text-white text-[9px] font-black px-2 py-1 rounded-md italic uppercase tracking-tighter shadow-md">
                      -{Math.round((1 - p.your_selling_price/p.original_market_price)*100)}%
                    </div>
                  )}
                </div>
                
                <div className="flex-grow space-y-1.5 px-1">
                  <div className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em]">{p.brand || 'Premium'}</div>
                  <h3 className="font-bold text-[13px] leading-tight h-10 overflow-hidden line-clamp-2 text-neutral-800">
                    {p.product_name}
                  </h3>
                  
                  <div className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {(p.sizes && p.sizes.length > 0 && p.sizes[0] !== 'F') ? (
                        <>
                          {p.sizes.slice(0, 4).map((s, i) => (
                            <span key={i} className="text-[9px] border border-neutral-200 rounded-md px-1.5 py-0.5 font-bold bg-white text-neutral-600">
                              {s}
                            </span>
                          ))}
                          {p.sizes.length > 4 && (
                            <span className="text-[9px] text-neutral-400 self-center ml-1 font-bold">
                              +{p.sizes.length - 4}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[9px] text-neutral-400 italic uppercase tracking-widest font-bold">Standard Size</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col">
                    <span className="text-xl font-black italic tracking-tight">HK$ {p.your_selling_price}</span>
                    {p.original_market_price > p.your_selling_price ? (
                      <span className="text-[10px] text-neutral-300 line-through tracking-tighter">MSRP: HK$ {p.original_market_price}</span>
                    ) : (
                      <span className="text-[10px] text-transparent">MSRP</span>
                    )}
                  </div>
                </div>
                
                <button className="w-full mt-4 py-3 bg-neutral-100 text-black rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white active:scale-95 transition-all flex items-center justify-center gap-2">
                  查看詳情
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 分頁控制 */}
        {totalPages > 0 && (
          <div className="mt-20 flex flex-col items-center gap-6 border-t border-neutral-100 pt-12">
            <div className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.4em]">
              第 {currentPage} 頁 / 共 {totalPages} 頁
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-full hover:bg-black hover:text-white transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-current"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              
              <div className="flex gap-2 font-mono text-sm flex-wrap justify-center">
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  // 只顯示當前頁面附近與首尾頁碼
                  if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
                    return (
                      <button 
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-8 h-8 rounded-full transition-colors ${currentPage === p ? 'bg-black text-white font-bold shadow-md' : 'text-neutral-400 hover:bg-neutral-100 hover:text-black'}`}
                      >
                        {p}
                      </button>
                    );
                  } else if (p === currentPage - 3 || p === currentPage + 3) {
                    return <span key={p} className="text-neutral-300 px-1 self-center">...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-full hover:bg-black hover:text-white transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-current"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-black text-white mt-32 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h3 className="text-2xl font-black italic tracking-tighter">EXCLSV_SELECT</h3>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em] leading-relaxed">
            Directly Sourced from EU Boutiques<br/>
            No Returns on Clearance Items<br/>
            © 2024 ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  );
}
