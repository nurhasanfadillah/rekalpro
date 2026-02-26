import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function getMarginBadge(profit, sellingPrice) {
  if (!sellingPrice || sellingPrice === 0) return { label: 'N/A', cls: 'badge-gray', Icon: Minus };
  const marginPct = (profit / sellingPrice) * 100;
  if (profit <= 0) return { label: 'Rugi', cls: 'badge-red', Icon: TrendingDown };
  if (marginPct < 10) return { label: 'Margin Rendah', cls: 'badge-amber', Icon: TrendingDown };
  if (marginPct >= 25) return { label: 'Margin Tinggi', cls: 'badge-green', Icon: TrendingUp };
  return { label: 'Margin Normal', cls: 'badge-blue', Icon: TrendingUp };
}

function ProductTable({ products, formatCurrency }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="table-container">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="table-header">
            <tr>
              <th className="table-th">Nama Produk</th>
              <th className="table-th">HPP</th>
              <th className="table-th">Harga Jual</th>
              <th className="table-th">Biaya Material</th>
              <th className="table-th">Laba</th>
              <th className="table-th">Status</th>
              <th className="table-th-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              const profit = product.gross_profit_per_unit || 0;
              const selling = product.estimated_selling_price || 0;
              const badge = getMarginBadge(profit, selling);
              const BadgeIcon = badge.Icon;
              const isEven = index % 2 === 0;

              return (
                <tr
                  key={product.id || `product-${index}`}
                  className={`table-row ${isEven ? '' : 'table-row-even'}`}
                >
                  <td className="table-td min-w-[160px]">
                    <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                        {product.description}
                      </div>
                    )}
                  </td>

                  <td className="table-td whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(product.production_cost || 0)}
                    </span>
                  </td>

                  <td className="table-td whitespace-nowrap">
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(selling)}
                    </span>
                  </td>

                  <td className="table-td whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {formatCurrency(product.total_material_cost || 0)}
                    </span>
                  </td>

                  <td className="table-td whitespace-nowrap">
                    <span className={`text-sm font-semibold ${profit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(profit)}
                    </span>
                  </td>

                  <td className="table-td">
                    <span className={`${badge.cls} inline-flex items-center gap-1`}>
                      <BadgeIcon className="h-3 w-3" />
                      {badge.label}
                    </span>
                  </td>

                  <td className="table-td-right">
                    <Link
                      to={`/products/${product.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-semibold transition-colors"
                    >
                      Detail
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-gray-400">
          Menampilkan <span className="font-semibold text-gray-600">{products.length}</span> produk
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            {'Margin Tinggi \u226525%'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            {'Rendah <10%'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            Rugi
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProductTable;
