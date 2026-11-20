import { Check, Copy, RotateCcw, Search, ShoppingBag, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard.tsx';
import { useBusiness } from '../context/BusinessContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { PRODUCT_CATEGORIES } from '../data/catalogData.ts';
import { api } from '../lib/api.ts';
import type { ProductItem } from '../types.ts';

type SortMode = 'featured' | 'price-asc' | 'price-desc';

export function ProductsPage() {
  const { brands, offers, openQuoteModal } = useBusiness();
  const { totalCount, openDrawer } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'All',
  );
  const [selectedBrand, setSelectedBrand] = useState<string>(
    searchParams.get('brand') || 'All',
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortMode, setSortMode] = useState<SortMode>('featured');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paramBrand = searchParams.get('brand') || 'All';
    const paramCat = searchParams.get('category') || 'All';
    setSelectedBrand(paramBrand);
    setSelectedCategory(paramCat);
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .getProducts({
        category: selectedCategory,
        brand: selectedBrand,
        search: searchQuery,
        inStock: inStockOnly,
      })
      .then((res) => {
        if (active) setProducts(res.products);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load store items.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategory, selectedBrand, searchQuery, inStockOnly]);

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortMode === 'price-asc') {
      list.sort((a, b) => (a.priceInr ?? Number.MAX_SAFE_INTEGER) - (b.priceInr ?? Number.MAX_SAFE_INTEGER));
    } else if (sortMode === 'price-desc') {
      list.sort((a, b) => (b.priceInr ?? -1) - (a.priceInr ?? -1));
    } else {
      list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [products, sortMode]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat === 'All') next.delete('category');
    else next.set('category', cat);
    setSearchParams(next, { replace: true });
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    const next = new URLSearchParams(searchParams);
    if (brand === 'All') next.delete('brand');
    else next.set('brand', brand);
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSearchQuery('');
    setInStockOnly(false);
    setSortMode('featured');
    setSearchParams({}, { replace: true });
  };

  const handleCopyCode = (code: string) => {
    void navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[75vh]">
      {/* Store Header */}
      <section className="bg-[#0B1B36] text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium text-[#DFB85A] mb-2">
            TRINETRA Online CCTV Store · 17 Categories · AP &amp; Telangana Delivery
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-3">
                Shop CCTV Cameras, Recorders &amp; Accessories
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Order cameras, DVR/NVR recorders, surveillance hard disks, PoE switches, racks,
                cables, and connectors online with Pay-on-Installation, Cash on Delivery, or
                request a custom bulk project quotation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={openDrawer}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-lg bg-[#C99B2E] text-[#061022] text-sm font-semibold hover:bg-[#DFB85A] transition-colors whitespace-nowrap cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Cart ({totalCount})</span>
              </button>
              <Link
                to="/planner"
                className="inline-flex items-center px-5 py-3 min-h-[44px] rounded-lg border border-white/25 text-sm font-semibold text-white hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                System Planner
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Admin-Managed Offers Strip */}
        {offers.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="p-4 rounded-xl bg-white border border-[#DFB85A]/60 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9E7216] mb-0.5">
                    <Tag className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>
                      {offer.discountType === 'flat'
                        ? `Flat ₹${offer.discountValue.toLocaleString('en-IN')} Off`
                        : `${offer.discountValue}% Off`}{' '}
                      · Min ₹{offer.minOrderInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="font-display font-semibold text-sm text-[#0B1B36] truncate">
                    {offer.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{offer.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(offer.code)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B1B36] text-white font-mono text-xs font-semibold hover:bg-[#13294E] shrink-0 cursor-pointer"
                >
                  <span>{offer.code}</span>
                  {copiedCode === offer.code ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#DFB85A]" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search, Brand, Sort & Category Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5 relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cameras, NVR, DVR, hard disks, cables..."
                aria-label="Search store products"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-[#0B1B36]"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                aria-label="Filter by brand"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900"
              >
                <option value="All">All Brands ({brands.length})</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                aria-label="Sort products"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[42px] rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:text-[#0B1B36] hover:border-[#0B1B36] transition-colors whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs font-medium text-slate-500">Filter by Category (17 Categories)</p>
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleCategoryChange('All')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-[#0B1B36] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {PRODUCT_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-[#0B1B36] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5 text-xs text-slate-600">
          <p className="font-mono tabular-nums">
            Showing <strong className="text-[#0B1B36]">{sortedProducts.length}</strong>{' '}
            {sortedProducts.length === 1 ? 'product' : 'products'}
            {selectedCategory !== 'All' ? ` · ${selectedCategory}` : ''}
            {selectedBrand !== 'All' ? ` · ${selectedBrand}` : ''}
          </p>
          <p>
            Need bulk dealer/project pricing?{' '}
            <button
              type="button"
              onClick={() => openQuoteModal({ subject: 'Bulk Hardware Quotation Request' })}
              className="font-semibold text-[#0B1B36] underline hover:text-[#9E7216] cursor-pointer"
            >
              Request Custom BoQ Quote
            </button>
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-5 w-3/4 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 bg-white border border-rose-200 rounded-xl text-center">
            <p className="text-sm text-rose-800 mb-3">{error}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg bg-[#0B1B36] text-white text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="p-10 bg-white border border-slate-200 rounded-xl text-center">
            <h2 className="font-display font-bold text-lg text-[#0B1B36] mb-1">
              No Matching Store Products
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-5">
              Reset filters or request an immediate quote for any model from our supported brands.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-[#0B1B36] hover:bg-slate-50 cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={() =>
                  openQuoteModal({
                    subject: `Model Enquiry: ${selectedBrand !== 'All' ? selectedBrand : ''} ${
                      selectedCategory !== 'All' ? selectedCategory : ''
                    }`.trim(),
                  })
                }
                className="px-5 py-2.5 rounded-lg bg-[#0B1B36] text-white text-sm font-semibold hover:bg-[#13294E] cursor-pointer"
              >
                Request Model Pricing
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
