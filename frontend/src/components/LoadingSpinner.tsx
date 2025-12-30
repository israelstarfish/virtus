//frontend/src/components/LoadingSpinner.tsx -> Spinner

type SpinnerProps = {
  size?: number;
  color?: string;
  fullscreen?: boolean;
};

export default function LoadingSpinner({
  size = 64,
  color = 'border-blue-500',
  fullscreen = true,
}: SpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullscreen ? 'h-screen' : ''
      } bg-black text-white`}
    >
      <div
        className={`animate-spin rounded-full h-[${size}px] w-[${size}px] border-t-4 ${color} border-opacity-50`}
      ></div>
    </div>
  );
}


// To use: <LoadingSpinner size={48} color="border-cyan-500" fullscreen={false} />

//export default function LoadingSpinner() {
//  return (
//    <div className="flex items-center justify-center h-screen bg-black text-white">
//      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>
//    </div>
//  );
//}