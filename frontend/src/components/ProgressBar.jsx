export default function ProgressBar({ value, color = '#4CAF50', className = '', height = 'h-2' }) {
  // Ограничиваем значение от 0 до 100
  const progress = Math.min(Math.max(value || 0, 0), 100);
  
  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ 
          width: `${progress}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
}