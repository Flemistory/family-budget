export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-green-600',
    secondary: 'bg-secondary text-white hover:bg-blue-600',
    danger: 'bg-danger text-white hover:bg-red-600',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-100',
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}