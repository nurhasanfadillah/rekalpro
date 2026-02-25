import { TrendingUp, DollarSign, Package, Calculator, LayoutGrid } from 'lucide-react';

function ScoreCard({ title, value, subtitle, type = 'default' }) {
  const icons = {
    count: LayoutGrid,
    bom: Package,
    hpp: Calculator,
    selling: DollarSign,
    profit: TrendingUp,
    default: DollarSign,
  };

  const colors = {
    count: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    bom: 'bg-blue-50 border-blue-200 text-blue-900',
    hpp: 'bg-orange-50 border-orange-200 text-orange-900',
    selling: 'bg-green-50 border-green-200 text-green-900',
    profit: 'bg-purple-50 border-purple-200 text-purple-900',
    default: 'bg-gray-50 border-gray-200 text-gray-900',
  };

  const Icon = icons[type] || icons.default;
  const colorClass = colors[type] || colors.default;

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (type === 'count') {
        return new Intl.NumberFormat('id-ID').format(val);
      }
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    }
    return val;
  };

  return (
    <div className={`card ${colorClass} border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{formatValue(value)}</p>
          {subtitle && (
            <p className="text-xs mt-1 opacity-70">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-white bg-opacity-50`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default ScoreCard;
