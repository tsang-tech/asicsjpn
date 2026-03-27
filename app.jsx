import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, Zap, ExternalLink, Menu, X, Filter } from 'lucide-react';

// 模擬從 Slam Jam 抓取的特價數據 (實際運作時這部分會由爬蟲產生的 JSON 取代)
const MOCK_DATA = [
  { id: '1', name: "Retro High OG 'Royal Reimagined'", category: "Footwear", brand: "Jordan", originalPrice: 1599, salePrice: 959, image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=400" },
  { id: '2', name: "Mountain Jacket GORE-TEX", category: "Apparel", brand: "The North Face", originalPrice: 3200, salePrice: 1920, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=400" },
  { id: '3', name: "Chuck 70 Marquis High", category: "Footwear", brand: "Converse", originalPrice: 899, salePrice: 450, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400" },
  { id: '4', name: "Logo Print Hoodie", category: "Apparel", brand: "Off-White", originalPrice: 4500, salePrice: 2250, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400" },
  { id: '5', name: "XT-6 Mindful Edition", category: "Footwear", brand: "Salomon", originalPrice: 1600, salePrice: 1120, image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400" },
  { id: '6', name: "Graphic T-Shirt", category: "Apparel", brand: "Stüssy", originalPrice: 450, salePrice: 315, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400" }
];

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const markup = 200; // 每件商品加價 $200

  useEffect(() => {
    // 處理數據：將 Slam Jam 的特價再加價 $200
    const processed = MOCK_DATA.map(p => ({
      ...p,
      displayPrice: p.salePrice + markup
    }));
    setProducts(processed);
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* 頂部通知欄 */}
      <div className="bg-orange-500 text-white text-center py-2 text-sm font-bold tracking-wide">
        限時特賣：全店商品由歐洲直郵，保證正品
      </div>

      {/* 導覽列 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-black tracking-tighter italic">EXCLSV_SELECT</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            <a href="#" className="hover:text-orange-500 transition-colors">最新到貨</a>
            <a href="#" className="hover:text-orange-500 transition-colors">鞋款</a>
            <a href="#" className="hover:text-orange-500 transition-colors">服飾</a>
            <a href="#" className="text-red-600 font-bold uppercase tracking-wider">SALE</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer group" onClick={() => alert("功能開發中：購物車詳情")}>
              <ShoppingBag size={22} className="group-hover:text-orange-500 transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄區塊 */}
      <section className="relative h-[400px] flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center"></div>
        <div className="relative text-center text-white px-4">
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight uppercase">Premium Outlet</h2>
          <p className="text-lg md:text-xl font-light max-w-xl mx-auto opacity-90">
            精選全球各大潮流品牌，直接對接歐洲買手店庫存，價格已含手續費及國際運費。
          </p>
        </div>
      </section>

      {/* 過濾與排序 */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-b border-neutral-200 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold uppercase text-xs tracking-widest text-neutral-500">
          <Filter size={14} />
          篩選條件
        </div>
        <div className="text-xs text-neutral-400">
          顯示所有 {products.length} 件特價單品
        </div>
      </div>

      {/* 產品網格 */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden bg-neutral-200 rounded-sm mb-4 relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase italic">
                  Save {Math.round((1 - product.salePrice/product.originalPrice)*100)}%
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{product.brand}</p>
                <h3 className="font-medium text-sm leading-tight group-hover:underline">{product.name}</h3>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-base font-black">HK$ {product.displayPrice}</span>
                  <span className="text-xs text-neutral-400 line-through">HK$ {product.originalPrice + markup}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  className="w-full mt-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap size={12} fill="currentColor" />
                  立即購買
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 底部資訊 */}
      <footer className="bg-white border-t border-neutral-200 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h4 className="font-black italic mb-4">EXCLSV_SELECT</h4>
            <p className="text-sm text-neutral-500 leading-relaxed">
              我們專注於尋找歐洲各大通路的遺珠單品。所有貨源均經過專業鑑定，保證 100% 正品。
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4">服務細則</h4>
            <ul className="text-sm text-neutral-500 space-y-2">
              <li className="hover:text-black cursor-pointer">運送與退換貨</li>
              <li className="hover:text-black cursor-pointer">正品保證聲明</li>
              <li className="hover:text-black cursor-pointer">聯絡我們</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4">追蹤我們</h4>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-all">
                <i className="fab fa-facebook-f text-sm"></i>
              </div>
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-all">
                <i className="fab fa-instagram text-sm"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-neutral-100 text-[10px] text-neutral-400 text-center uppercase tracking-[0.2em]">
          © 2024 Exclusive Select HK. Not affiliated with any referenced third-party retailers.
        </div>
      </footer>
    </div>
  );
};

export default App;
