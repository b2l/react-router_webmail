export function Logo() {
  return (
    <div className="flex gap-3 items-center px-3 pt-0.5 h-16 w-50 box-border">
      <div className="relative block h-8 w-8">
        <div className="absolute h-8 w-8 rounded-full border-1 border-white"></div>
        <div className="absolute h-8 w-8 rounded-full border-2 border-white translate-1"></div>
      </div>
      <div className="text-white text-2xl">Envoy</div>
    </div>
  );
}
