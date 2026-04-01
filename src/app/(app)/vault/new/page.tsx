"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useReducer } from "react";
import { ConnectGuard } from "@/components/ConnectGuard";
import { ContentLayout } from "@/components/ContentLayout";
import { AllocationStep } from "@/components/vault-wizard/AllocationStep";
import type { SignalAction } from "@/components/vault-wizard/SignalActionCard";
import { SignalStep } from "@/components/vault-wizard/SignalStep";
import { StockSelectionStep } from "@/components/vault-wizard/StockSelectionStep";
import { StrategyStep } from "@/components/vault-wizard/StrategyStep";
import { WizardHeader } from "@/components/vault-wizard/WizardHeader";
import { BASKETS } from "@/lib/data";

export type WizardState = {
  currentStep: 1 | 2 | 3 | 4;
  direction: "forward" | "backward";
  selectedTickers: string[];
  allocations: Record<string, number>;
  strategy: "manual" | "dca";
  dcaFrequency: "daily" | "weekly" | "monthly";
  amount: number;
  vaultName: string;
  signal: { id: string; question: string; probability: number } | null;
  signalThreshold: number;
  signalAction: SignalAction | null;
};

export type WizardAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_VAULT_NAME"; name: string }
  | { type: "TOGGLE_STOCK"; ticker: string }
  | { type: "APPLY_BASKET"; basketId: string }
  | { type: "SET_ALLOCATION"; ticker: string; weight: number }
  | { type: "EQUALIZE_ALLOCATIONS" }
  | { type: "SET_STRATEGY"; strategy: WizardState["strategy"] }
  | { type: "SET_DCA_FREQUENCY"; frequency: WizardState["dcaFrequency"] }
  | { type: "SET_AMOUNT"; amount: number }
  | { type: "GO_TO_STEP"; step: 1 | 2 | 3 | 4 }
  | { type: "RESET_SELECTIONS" }
  | { type: "SET_SIGNAL"; signal: WizardState["signal"] }
  | { type: "CLEAR_SIGNAL" }
  | { type: "SET_SIGNAL_THRESHOLD"; threshold: number }
  | { type: "SET_SIGNAL_ACTION"; action: SignalAction };

function equalizeAllocations(tickers: string[]): Record<string, number> {
  if (tickers.length === 0) return {};
  const base = Math.floor(100 / tickers.length);
  const remainder = 100 - base * tickers.length;
  const result: Record<string, number> = {};
  for (let i = 0; i < tickers.length; i++) {
    result[tickers[i]] = base + (i < remainder ? 1 : 0);
  }
  return result;
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "NEXT_STEP": {
      if (state.currentStep >= 4) return state;
      const nextStep = (state.currentStep + 1) as 1 | 2 | 3 | 4;
      let allocations = state.allocations;
      if (state.currentStep === 1) {
        const needsInit = state.selectedTickers.some(
          (t) => !(t in state.allocations),
        );
        if (needsInit || Object.keys(state.allocations).length === 0) {
          allocations = equalizeAllocations(state.selectedTickers);
        }
      }
      return {
        ...state,
        currentStep: nextStep,
        direction: "forward",
        allocations,
      };
    }
    case "PREV_STEP": {
      if (state.currentStep <= 1) return state;
      return {
        ...state,
        currentStep: (state.currentStep - 1) as 1 | 2 | 3 | 4,
        direction: "backward",
      };
    }
    case "GO_TO_STEP": {
      if (action.step >= state.currentStep) return state;
      return {
        ...state,
        currentStep: action.step,
        direction: "backward",
      };
    }
    case "SET_VAULT_NAME":
      return { ...state, vaultName: action.name };
    case "TOGGLE_STOCK": {
      const exists = state.selectedTickers.includes(action.ticker);
      const selectedTickers = exists
        ? state.selectedTickers.filter((t) => t !== action.ticker)
        : [...state.selectedTickers, action.ticker];
      const allocations = { ...state.allocations };
      if (exists) {
        delete allocations[action.ticker];
      }
      return { ...state, selectedTickers, allocations };
    }
    case "APPLY_BASKET": {
      const basket = BASKETS.find((b) => b.id === action.basketId);
      if (!basket) return state;
      const selectedTickers = basket.allocations.map((a) => a.ticker);
      const allocations: Record<string, number> = {};
      for (const a of basket.allocations) {
        allocations[a.ticker] = a.weight;
      }
      return { ...state, selectedTickers, allocations };
    }
    case "SET_ALLOCATION":
      return {
        ...state,
        allocations: { ...state.allocations, [action.ticker]: action.weight },
      };
    case "EQUALIZE_ALLOCATIONS":
      return {
        ...state,
        allocations: equalizeAllocations(state.selectedTickers),
      };
    case "SET_STRATEGY":
      return { ...state, strategy: action.strategy };
    case "SET_DCA_FREQUENCY":
      return { ...state, dcaFrequency: action.frequency };
    case "SET_AMOUNT":
      return { ...state, amount: action.amount };
    case "RESET_SELECTIONS":
      return {
        ...state,
        currentStep: 1,
        direction: "backward" as const,
        selectedTickers: [],
        allocations: {},
      };
    case "SET_SIGNAL":
      return { ...state, signal: action.signal };
    case "CLEAR_SIGNAL":
      return { ...state, signal: null, signalAction: null };
    case "SET_SIGNAL_THRESHOLD":
      return { ...state, signalThreshold: action.threshold };
    case "SET_SIGNAL_ACTION":
      return { ...state, signalAction: action.action };
  }
}

const initialState: WizardState = {
  currentStep: 1,
  direction: "forward",
  selectedTickers: [],
  allocations: {},
  strategy: "dca",
  dcaFrequency: "weekly",
  amount: 0,
  vaultName: "",
  signal: null,
  signalThreshold: 40,
  signalAction: null,
};

const variants = {
  enter: (direction: "forward" | "backward") => ({
    x: direction === "forward" ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: "forward" | "backward") => ({
    x: direction === "forward" ? -80 : 80,
    opacity: 0,
  }),
};

export default function NewVaultPage() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  return (
    <ConnectGuard>
      <ContentLayout>
        <div className="space-y-6">
          <WizardHeader
            currentStep={state.currentStep}
            onBack={() => dispatch({ type: "PREV_STEP" })}
            onGoToStep={(step) => dispatch({ type: "GO_TO_STEP", step })}
          />

          <AnimatePresence mode="wait" custom={state.direction}>
            <motion.div
              key={state.currentStep}
              custom={state.direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {state.currentStep === 1 && (
                <StockSelectionStep state={state} dispatch={dispatch} />
              )}
              {state.currentStep === 2 && (
                <AllocationStep state={state} dispatch={dispatch} />
              )}
              {state.currentStep === 3 && (
                <StrategyStep state={state} dispatch={dispatch} />
              )}
              {state.currentStep === 4 && (
                <SignalStep state={state} dispatch={dispatch} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </ContentLayout>
    </ConnectGuard>
  );
}
