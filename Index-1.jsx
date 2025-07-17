import PropertyCard from "@/components/PropertyCard";

export default async function Home() {
  const res = await fetch("https://yourapi.com/api/properties");
  const properties = await res.json();

  return (
    <main className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {properties.map((prop, i) => (
        <PropertyCard key={i} prop={prop} />
      ))}
    </main>
  );
}
