import { PricingClient } from '@/components/pricing/PricingClient'
import { PLANS } from '@/lib/pricing/plans'

export const metadata = {
  title: 'Pricing — Rifair AI',
  description:
    'Simple, transparent pricing for bias-free hiring. Start free, upgrade when you need more.',
}

export default function PricingPage() {
  return <PricingClient plans={PLANS} />
}
