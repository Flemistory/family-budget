export default function ProgressBar({ progress, color = 'bg-primary' }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${color} transition-all duration-500`}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}