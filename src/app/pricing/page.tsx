"use client";

import { HiCheck, HiArrowRight } from "react-icons/hi";
import Link from "next/link";
import Button from "@/components/ui/Button";

const tiers = [
    {
        name: "Starter",
        description: "Perfect for small institutions getting started with digital learning",
        price: "Free",
        limit: "Up to 500 members",
    },
    {
        name: "Growth",
        description: "Ideal for growing institutions with advanced needs",
        price: "$4",
        priceDetail: "per user/month",
        limit: "Up to 1000 members",
        popular: true
    },
    {
        name: "Enterprise",
        description: "Customized solutions for large institutions",
        price: "Custom",
        limit: "Unlimited members",
    }
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background-muted py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Simple, transparent pricing
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-foreground-muted">
                        Choose the perfect plan for your institution's needs
                    </p>
                </div>


                {/* Pricing Cards - Mobile Friendly */}
                <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`flex flex-col justify-between rounded-3xl bg-background p-8 ring-1 ring-border xl:p-10 ${
                                tier.popular ? 'ring-2 ring-primary-500' : ''
                            }`}
                        >
                            <div>
                                {tier.popular && (
                                    <div className="mb-4">
                                        <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-foreground">{tier.name}</h3>
                                <p className="mt-4 text-sm leading-6 text-foreground-muted">
                                    {tier.description}
                                </p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                                    {tier.priceDetail && (
                                        <span className="text-sm text-foreground-muted">{tier.priceDetail}</span>
                                    )}
                                </p>
                                <p className="mt-2 text-sm text-primary-500 font-medium">
                                    {tier.limit}
                                </p>
                            </div>
                            <div className="mt-8">
                                {tier.name === "Enterprise" ? (
                                    <Link href="#contact">
                                        <Button.Primary className="w-full flex items-center justify-center">
                                            <span>Get a Quote</span>
                                            <HiArrowRight className="ml-2 h-4 w-4" />
                                        </Button.Primary>
                                    </Link>
                                ) : (
                                    <Link href="/signup">
                                        <Button.Primary className="w-full flex items-center justify-center">
                                            <span>Get Started</span>
                                            <HiArrowRight className="ml-2 h-4 w-4" />
                                        </Button.Primary>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Enterprise CTA */}
                <div className="mt-20 rounded-2xl bg-primary-600 py-10 px-6 sm:py-16 sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-background sm:text-4xl">
                            Need a custom solution?
                        </h2>
                        <p className="mt-4 text-lg text-primary-100">
                            Let's discuss how we can tailor Easy LMS to your institution's specific requirements.
                        </p>
                    </div>
                    <div className="mt-6 lg:mt-0 lg:ml-8">
                        <Link href="#contact">
                            <Button.Light className="bg-background text-primary-600 hover:bg-primary-50">
                                Contact Sales
                            </Button.Light>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
