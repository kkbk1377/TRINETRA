import { Check, MessageCircle, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useBusiness } from '../context/BusinessContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { formatWhatsAppUrl } from '../data/catalogData.ts';
import type { ProductItem } from '../types.ts';
import { SafeImage } from './SafeImage.tsx';

interface ProductCardProps {
  product: ProductItem;
}

function formatInr(amount: number | null): string {
  if (amount === null || !Number.isFinite(amount)) {
    return 'Price on Request';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProductCard({ product }: ProductCardProps) {
  const { settings, openQuoteModal } = useBusiness();
  const { addToCart, openDrawer } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const canBuyOnline =
    product.priceInr !== null &&
    product.priceInr > 0 &&
    product.availability !== 'Out of Stock';

  const savingsPct =
    product.mrpInr && product.priceInr && product.mrpInr > product.priceInr
      ? Math.round(((product.mrpInr - product.priceInr) / product.mrpInr) * 100)
      : null;

  const whatsappText = `Hello ${settings.businessName}, I would like to enquire about:\nProduct: ${product.name}\nBrand: ${product.brand}\nCategory: ${product.category}\nModel: ${product.model}${
    product.priceInr ? `\nListed Price: ₹${product.priceInr.toLocaleString('en-IN')}` : ''
  }`;
  const whatsappUrl = formatWhatsAppUrl(settings.whatsapp, whatsappText);

  const availabilityTextClass =
    product.availability === 'In Stock'
      ? 'text-emerald-700'
      : product.availability === 'Out of Stock'
        ? 'text-rose-700'
        : 'text-slate-600';

  const handleAdd = () => {
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <article className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      {/* Uniform 4:3 Product Image */}
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
        <SafeImage
          src={product.imageUrl}
          alt={`${product.brand} ${product.name}`}
          fallbackTitle={`${product.brand} · ${product.category}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mb-1.5">
          <span className="font-semibold text-[#0B1B36]">{product.brand}</span>
          <span aria-hidden="true">·</span>
          <span>{product.category}</span>
        </div>

        <h3 className="font-display font-semibold text-base text-[#0B1B36] leading-snug mb-1">
          {product.name}
        </h3>

        <p className="font-mono text-xs text-slate-500 mb-2.5 truncate" title={product.model}>
          Model: {product.model}
        </p>

        <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1 line-clamp-3">
          {product.description}
        </p>

        {product.warranty && (
          <p className="text-xs text-slate-500 mb-3">{product.warranty}</p>
        )}

        {/* Pricing + Availability */}
        <div className="pt-3.5 border-t border-slate-100 mb-4 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-mono tabular-nums text-base font-bold text-[#0B1B36]">
              {formatInr(product.priceInr)}
            </span>
            {product.mrpInr && product.priceInr && product.mrpInr > product.priceInr && (
              <span className="font-mono tabular-nums text-xs text-slate-400 line-through">
                {formatInr(product.mrpInr)}
              </span>
            )}
            {savingsPct !== null && (
              <span className="text-xs font-semibold text-emerald-700">Save {savingsPct}%</span>
            )}
          </div>
          <span className={`text-xs font-medium whitespace-nowrap ${availabilityTextClass}`}>
            {product.availability}
          </span>
        </div>

        {/* Store Actions */}
        <div className="space-y-2">
          {canBuyOnline ? (
            <button
              type="button"
              onClick={justAdded ? openDrawer : handleAdd}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                justAdded
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-[#0B1B36] text-white hover:bg-[#13294E]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Added — View Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#DFB85A] shrink-0" aria-hidden="true" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                openQuoteModal({
                  subject: `Quotation for ${product.brand} ${product.name}`,
                  productRef: `${product.brand} — ${product.name} (${product.model})`,
                })
              }
              className="w-full inline-flex items-center justify-center px-4 py-2.5 min-h-[42px] rounded-lg bg-[#0B1B36] text-white text-xs font-semibold hover:bg-[#13294E] transition-colors whitespace-nowrap cursor-pointer"
            >
              Request Best Price
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg border border-slate-300 bg-white text-[#0B1B36] text-xs font-semibold hover:border-[#0B1B36] hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#9E7216] shrink-0" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() =>
                openQuoteModal({
                  subject: `Quotation for ${product.brand} ${product.name}`,
                  productRef: `${product.brand} — ${product.name} (${product.model})`,
                })
              }
              className="inline-flex items-center justify-center px-3 py-2 min-h-[38px] rounded-lg border border-slate-300 bg-white text-[#0B1B36] text-xs font-semibold hover:border-[#0B1B36] hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Bulk Quote
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
