export default function Header({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
        <h1 className="text-xl sm:text-5xl font-black text-[#2C3228]">{title}</h1>
       <p className="text-[#4A5043] mt-0.5 sm:mt-2 text-[10px] sm:text-base">{description}</p>
    </div>
  );
}
        