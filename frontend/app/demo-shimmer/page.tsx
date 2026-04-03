import ShimmerText from "@/components/ui/shimmer-text"

export default function Demo() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background gap-8">
      <ShimmerText className="text-4xl font-bold tracking-tight">Introducing the future</ShimmerText>
      <ShimmerText className="text-xl font-medium" variant="blue">Gradient Shimmer Effect</ShimmerText>
      <ShimmerText className="text-lg font-semibold" variant="emerald">Emerald Shimmering Text</ShimmerText>
    </div>
  )
}
