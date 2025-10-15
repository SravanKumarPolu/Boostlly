"use client";

import { Suspense } from "react";
import {
  TabSkeleton,
  StatsSkeleton,
  SearchSkeleton,
  CollectionsSkeleton,
} from "@boostlly/ui";
import {
  createLazyComponent,
  createLazyPage,
} from "../../components/lazy-loading-utils";
import {
  ChartSkeleton,
  PageSkeleton,
} from "../../components/loading-fallbacks";

// Enhanced lazy load tab components with better error handling
const TodayTab = createLazyComponent(
  () => import("@boostlly/features").then((mod) => ({ default: mod.TodayTab })),
  {
    loading: () => <TabSkeleton />,
    ssr: false,
  },
);

const CollectionsTab = createLazyComponent(
  () =>
    import("@boostlly/features").then((mod) => ({
      default: mod.CollectionsTab,
    })),
  {
    loading: () => <CollectionsSkeleton />,
    ssr: false,
  },
);

const AdvancedSearch = createLazyComponent(
  () =>
    import("@boostlly/features").then((mod) => ({
      default: mod.AdvancedSearch,
    })),
  {
    loading: () => <SearchSkeleton />,
    ssr: false,
  },
);

// Lazy load page components with enhanced loading states
const SettingsTab = createLazyPage(() => import("../settings/page"));
const HelpTab = createLazyPage(() => import("../help/page"));
const PopupTab = createLazyPage(() => import("../popup/page"));

// Lazy load chart components for analytics
const AnalyticsChart = createLazyComponent(
  () =>
    import("../../components/chart-component").then((mod) => ({
      default: mod.default,
    })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  },
);

// Lazy load heavy components
const GamificationTab = createLazyPage(() => import("../gamification/page"));
const SmartTab = createLazyPage(() => import("../smart/page"));
const VoiceTab = createLazyPage(() => import("../voice/page"));

export {
  TodayTab,
  CollectionsTab,
  AdvancedSearch,
  SettingsTab,
  HelpTab,
  PopupTab,
  AnalyticsChart,
  GamificationTab,
  SmartTab,
  VoiceTab,
};
