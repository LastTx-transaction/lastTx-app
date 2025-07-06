"use client";

import { useCurrentFlowUser } from "@onflow/kit";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  Clock,
  Wallet,
  FileText,
  Lock,
  ArrowRight,
  Zap,
  Leaf,
  Code,
  Server,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

export default function Home() {
  const { user, authenticate } = useCurrentFlowUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:py-32">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <Badge
                variant="secondary"
                className="mb-8 text-xs font-medium px-4 py-2 ring-1 ring-green-300 backdrop-blur-sm border-0 shadow-lg rotate-6 translate-x-[70%] hover:rotate-12 transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2 text-green-500" />
                Powered by Flow Wallet
              </Badge>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Last Tx
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-foreground">
                Secure Your Digital Legacy with Smart Inheritance
              </p>
              <p className="text-lg md:text-xl mb-8 text-muted-foreground max-w-3xl mx-auto">
                Create smart contracts that automatically{" "}
                <span className="text-yellow-500 font-bold">
                  inherit your crypto assets
                </span>{" "}
                to beneficiaries if you don&apos;t interact with your wallet for
                specified periods. You stay in control while ensuring your loved
                ones are protected if anything happens. Powered by{" "}
                <strong className="text-green-500 font-bold">
                  Flow blockchain security
                </strong>
                .
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-up delay-300">
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Blockchain Secured
                </h3>
                <p className="text-muted-foreground">
                  Powered by Flow smart contracts for ultimate security
                </p>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Family Protected
                </h3>
                <p className="text-muted-foreground">
                  Ensure your loved ones inherit your digital assets
                </p>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Time-Based
                </h3>
                <p className="text-muted-foreground">
                  Automatic execution after specified time periods
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 bg-secondary/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              The Problem We&apos;re Solving
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-12">
              Billions of dollars in cryptocurrency are lost forever every year
              due to preventable circumstances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center animate-fade-in-up delay-100">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-4xl">💀</div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                Death & Accidents
              </h3>
              <p className="text-muted-foreground">
                When crypto holders pass away unexpectedly, their private keys
                often die with them, making their assets permanently
                inaccessible to surviving family members.
              </p>
            </div>

            <div className="text-center animate-fade-in-up delay-200">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-4xl">🔐</div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                Lost Keys & Passwords
              </h3>
              <p className="text-muted-foreground">
                Forgotten passwords, lost hardware wallets, and misplaced seed
                phrases result in permanent loss of access to valuable
                cryptocurrency holdings.
              </p>
            </div>

            <div className="text-center animate-fade-in-up delay-300">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-4xl">🚨</div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                Political Intervention
              </h3>
              <p className="text-muted-foreground">
                Detention, imprisonment, or political persecution can prevent
                access to crypto assets, leaving families without financial
                resources during critical times.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 max-w-4xl mx-auto animate-fade-in-up delay-400">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                The Devastating Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    $140B+
                  </div>
                  <p className="text-sm text-yellow-700">
                    Lost Bitcoin alone due to forgotten keys
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    20%
                  </div>
                  <p className="text-sm text-yellow-700">
                    Of all Bitcoin is permanently lost
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    4M+
                  </div>
                  <p className="text-sm text-yellow-700">
                    Bitcoin lost due to death/lost keys
                  </p>
                </div>
              </div>
              <p className="text-lg text-muted-foreground">
                <strong className="text-primary">Last Tx</strong> ensures your
                crypto doesn&apos;t join these statistics. Our inactivity-based{" "}
                <strong className="text-primary">inheritance system</strong>{" "}
                provides automatic protection while keeping you in complete
                control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Last Tx Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three simple steps to secure your crypto legacy and protect your
              family&apos;s future
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group animate-fade-in-up delay-100">
              <div className="bg-card w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-border group-hover:border-primary/50 transition-all duration-300 group-hover:scale-110">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                1. Set Your Inheritance Rules
              </h3>
              <p className="text-muted-foreground">
                Connect your Flow wallet and create multiple inheritance
                contracts. Set different inactivity periods (days/months/years)
                and specify what percentage of your assets goes to each
                beneficiary.
              </p>
            </div>

            <div className="text-center group animate-fade-in-up delay-200">
              <div className="bg-card w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-border group-hover:border-primary/50 transition-all duration-300 group-hover:scale-110">
                <Lock className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                2. Live Your Life Normally
              </h3>
              <p className="text-muted-foreground">
                Your assets remain completely under your control. Any wallet
                transaction automatically resets all your inactivity timers. You
                can modify, edit, or delete inheritance rules anytime.
              </p>
            </div>

            <div className="text-center group animate-fade-in-up delay-300">
              <div className="bg-card w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-border group-hover:border-primary/50 transition-all duration-300 group-hover:scale-110">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                3. Automatic Protection
              </h3>
              <p className="text-muted-foreground">
                If you don&apos;t interact with your wallet for the specified
                time periods, smart contracts automatically trigger and transfer
                your designated asset percentages to your chosen beneficiaries.
              </p>
            </div>
          </div>

          <div className="mt-16 animate-fade-in-up delay-400">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Built on Flow Blockchain
              </h3>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Last Tx leverages Flow&apos;s advanced capabilities to provide
                secure, efficient, and sustainable digital inheritance
                solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Features grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                    <Zap className="h-6 w-6 text-green-500" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Gas Efficient
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Low-cost transactions with optimized smart contracts
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <Code className="h-6 w-6 text-blue-500" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Developer Friendly
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Built with Cadence smart contract language
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                    <Leaf className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Sustainable
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Carbon-negative blockchain with proof-of-stake
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                    <Server className="h-6 w-6 text-purple-500" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Enterprise Ready
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Audited contracts with institutional security
                  </p>
                </div>
              </div>

              {/* Right side - Main feature highlight */}
              <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl border border-border p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mr-4">
                      <Shield className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-foreground">
                        Smart Contract Security
                      </h4>
                      <p className="text-muted-foreground">
                        Immutable & Transparent
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Your digital will is protected by Flow&apos;s robust smart
                    contract architecture. Once deployed, your inheritance
                    instructions become immutable and automatically executable,
                    ensuring your wishes are carried out exactly as specified.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-sm text-muted-foreground">
                        Audited smart contracts
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-sm text-muted-foreground">
                        Multi-signature security
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-sm text-muted-foreground">
                        Automated execution
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-sm text-muted-foreground">
                        Transparent operations
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 py-1 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Powered by Flow
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about Last Tx and crypto inheritance
            </p>
          </div>

          <div className="animate-fade-in-up delay-100">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem
                value="item-1"
                className="border border-border rounded-lg bg-card px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg font-semibold text-foreground">
                    How does the inactivity-based inheritance system work?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  You create multiple smart contracts, each with different
                  inactivity periods (like 30 days, 1 year, etc.) and
                  beneficiaries. If you don&apos;t use your wallet for the
                  specified time, that specific contract triggers automatically
                  and transfers the designated percentage of your assets to the
                  beneficiary. Any wallet activity resets all your timers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="border border-border rounded-lg bg-card px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg font-semibold text-foreground">
                    Can I modify my inheritance rules after creating them?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Yes! You have full control over your inheritance contracts.
                  You can edit beneficiaries, change percentages, modify
                  inactivity periods, add new rules, or delete existing ones
                  anytime. You can also manually refresh any timer by simply
                  using your wallet or clicking the refresh button.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="border border-border rounded-lg bg-card px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg font-semibold text-foreground">
                    What counts as wallet activity to reset the timers?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Any transaction from your wallet resets all inactivity timers
                  - sending tokens, receiving tokens, interacting with smart
                  contracts, or even small test transactions. You can also
                  manually refresh timers through the Last Tx interface without
                  making any transactions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="border border-border rounded-lg bg-card px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg font-semibold text-foreground">
                    How do beneficiaries claim their inheritance?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  When an inactivity timer triggers, the smart contract
                  automatically transfers the designated assets to the
                  beneficiary&apos;s wallet address. No action is required from
                  the beneficiary - they simply receive a notification and the
                  assets appear in their wallet.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-5"
                className="border border-border rounded-lg bg-card px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg font-semibold text-foreground">
                    What happens to my assets while the contracts are active?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Your assets remain completely under your control. You can
                  spend, trade, or invest them normally. The inheritance
                  contracts only monitor your wallet activity and trigger
                  transfers if inactivity periods are exceeded. You maintain
                  full ownership and control at all times.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-6"
                className="border border-border rounded-lg bg-card px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg font-semibold text-foreground">
                    What if I recover access to my wallet after a contract
                    triggers?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Once a contract triggers and transfers assets, that specific
                  inheritance rule is completed. However, you can create new
                  inheritance rules for your remaining assets. This system is
                  designed to help in situations like forgotten passwords, lost
                  devices, or unexpected events.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Protect Your Digital Assets?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Set up your first inactivity-based inheritance contract in minutes
            and give yourself peace of mind
          </p>

          {user?.loggedIn ? (
            <Link href="/create-will">
              <Button variant="secondary" size="lg" className="group">
                <FileText className="mr-2 h-5 w-5" />
                Create Your Will Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={authenticate}
              variant="secondary"
              size="lg"
              className="group"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
