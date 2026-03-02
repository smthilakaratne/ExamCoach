export default function Spinner({ fullPage }) {
  return (
    <div className={`flex justify-center items-center ${fullPage ? 'min-h-screen' : 'py-10'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}