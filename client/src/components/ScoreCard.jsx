import { TrendingUp, DollarSign, Package, Calculator, LayoutGrid } from 'lucide-react';

const typeConfig = {
  count: {
    icon: LayoutGrid,
    accent: 'border-l-indigo-500',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    valueColor: 'text-indigo-700',
    bg: 'bg-white',
  },
  bom: {
    icon: Package,
    accent: 'border-l-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-700',
    bg: 'bg-white',
  },
  hpp: {
    icon: Calculator,
    accent: 'border-l-orange-500',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    valueColor: 'text-orange-700',
    bg: 'bg-white',
  },
  selling: {
    icon: DollarSign,
    accent: 'border-l-emerald-500',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-700',
    bg: 'bg-white',
  },
  profit: {
    icon: TrendingUp,
    accent: 'border-l-violet-500',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    valueColor: 'text-violet-700',
    bg: 'bg-white',
  },
  default: {
    icon: DollarSign,
    accent: 'border-l-gray-400',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    valueColor: 'text-gray-700',
    bg: 'bg-white',
  },
};

function ScoreCard({ title, value, subtitle, type = 'default' }) {
  const config = typeConfig[type] || typeConfig.default;
  const Icon = config.icon;

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
    <div className={`${config.bg} rounded-2xl shadow-sm border border-gray-100 border-l-4 ${config.accent} p-5 hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className={`text-xl font-bold mt-1.5 ${config.valueColor} leading-tight truncate`}>
            {formatValue(value)}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1.5 truncate">{subtitle}</p>
          )}
        </div>
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${config.iconBg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
      </div>
    </div>
  );
}

export default ScoreCard;
