import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap, Filter, RefreshCw } from 'lucide-react';

const App = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // 載入爬蟲抓取的 products.json
    fetch('./products.json')
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("無法載入商品資料:", err);
        setLoading(false);
      });
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
    // 這裡可以加入跳轉到 WhatsApp 或結帳頁面的邏輯
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
          <h1 className="text-xl font-black tracking-tighter italic">EXCLSV_SELECT</h1>
          
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
      <header className="bg-white border-b border-neutral-100 py-12 px-4 text-center">
        <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Outlet Inventory</h2>
        <p className="text-neutral-500 text-sm max-w-md mx-auto">
          即時同步歐洲買手店特價庫存。價格已包含國際運費與代購服務費。
        </p>
      </header>

      {/* 工具欄 */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center bg-white mt-4 border border-neutral-200 rounded-sm">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          <Filter size={14} />
          {loading ? "更新中..." : `共計 ${products.length} 件特價商品`}
        </div>
      </div>

      {/* 產品列表 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <RefreshCw className="animate-spin mb-4" size={32} />
            <p className="text-sm">正在從雲端更新 1900+ 件商品資料...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {products.map((product, index) => (
              <div key={index} className="group">
                <div className="aspect-[3/4] overflow-hidden bg-neutral-100 rounded-sm mb-3 relative">
                  <img 
                    src={product.image || 'https://via.placeholder.com/400x533?text=Coming+Soon'} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-1 italic uppercase shadow-xl">
                    Sale
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-xs truncate uppercase tracking-tight">{product.name}</h3>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-black">HK$ {product.my_price}</span>
                    <span className="text-[10px] text-neutral-400 line-through tracking-wide">
                      MKT Price: HK$ {product.original_price}
                    </span>
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full mt-3 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap size={10} fill="currentColor" />
                    立即訂購
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-neutral-200 mt-20 py-10 text-center">
        <p className="text-[10px] text-neutral-400 uppercase tracking-widest leading-loose">
          © 2024 EXCLUSIVE SELECT HK<br/>
          Direct from European Retailers • Updated Daily
        </p>
      </footer>
    </div>
  );
};

export default App;
