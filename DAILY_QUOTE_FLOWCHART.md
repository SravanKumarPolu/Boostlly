# Daily Quote System - Complete Flowchart

## Main Flow

```mermaid
flowchart TD
    Start([User Opens App]) --> Mount[TodayTab Component Mounts]
    Mount --> SyncCheck{Synchronous Cache Check}
    
    SyncCheck -->|Stale Date| ClearCache[Clear All Cache Keys]
    SyncCheck -->|Valid Date| CheckStore[Check Zustand Store]
    ClearCache --> CheckStore
    
    CheckStore -->|Quote Exists| RenderCached[Render Cached Quote]
    CheckStore -->|No Quote| LoadQuote[Load Quote via QuoteService]
    
    LoadQuote --> TryGetQuoteByDay{Try getQuoteByDay}
    TryGetQuoteByDay -->|Available| GetQuoteByDay[getQuoteByDay Method]
    TryGetQuoteByDay -->|Not Available| GetDailyQuote[getDailyQuote Method]
    
    GetQuoteByDay --> CheckForce{Force Refresh?}
    CheckForce -->|Yes| ClearDayCache[Clear dayBasedQuote Cache]
    CheckForce -->|No| CheckDayCache{Check dayBasedQuote Cache}
    
    ClearDayCache --> GetProvider
    CheckDayCache -->|Cache Hit & Date Match| ReturnCached[Return Cached Quote]
    CheckDayCache -->|Cache Miss or Stale| GetProvider[Get Today's Provider]
    
    GetProvider --> GetDayOfWeek[Get Day of Week 0-6]
    GetDayOfWeek --> SelectProvider[Select Provider from WEEKLY_SCHEDULE]
    SelectProvider --> ProviderAvailable{Provider Available?}
    
    ProviderAvailable -->|No| FallbackChain[Try Fallback Chain]
    ProviderAvailable -->|Yes| CallProvider[Call provider.random]
    
    CallProvider --> APISuccess{API Success?}
    APISuccess -->|Yes| CacheQuote[Cache Quote with Date Key]
    APISuccess -->|No| FallbackChain
    
    FallbackChain --> TryNext{More Providers?}
    TryNext -->|Yes| CallProvider
    TryNext -->|No| FallbackToLocal[Fallback to getDailyQuote]
    
    FallbackToLocal --> GetDailyQuote
    GetDailyQuote --> GetAllQuotes[Get All Quotes Pool]
    
    GetAllQuotes --> BundledQuotes[Bundled Quotes]
    BundledQuotes --> CachedAPI[Cached API Quotes]
    CachedAPI --> UserSaved[User Saved Quotes]
    
    UserSaved --> GetHistory[Get Recent 7-Day History]
    GetHistory --> EnoughQuotes{Enough Quotes?}
    
    EnoughQuotes -->|Yes| FilterRecent[Filter Out Recent Quotes]
    EnoughQuotes -->|No| UseAll[Use All Quotes]
    FilterRecent --> UseAll
    
    UseAll --> CalculateIndex[Calculate Quote Index from Date]
    CalculateIndex --> HashDate[djb2Hash Date Key]
    HashDate --> ModuloArray[Modulo Array Length]
    ModuloArray --> SelectQuote[Select Quote by Index]
    
    SelectQuote --> UpdateHistory[Update Quote History]
    UpdateHistory --> CacheWithDate[Cache with Date Key]
    CacheWithDate --> ReturnQuote[Return Quote]
    
    CacheQuote --> ReturnQuote
    ReturnCached --> ReturnQuote
    
    ReturnQuote --> UpdateStore[Update Zustand Store]
    UpdateStore --> RenderCard[Render Quote Card]
    
    RenderCard --> AutoTheme[Auto-Theme Background]
    AutoTheme --> CalculateContrast[Calculate Text Contrast]
    CalculateContrast --> ApplyStyles[Apply Glassmorphism Styles]
    ApplyStyles --> DisplayQuote[Display Quote + Actions]
    
    DisplayQuote --> End([User Sees Quote])
    
    style GetQuoteByDay fill:#e1f5ff
    style GetProvider fill:#fff4e1
    style FallbackToLocal fill:#ffe1e1
    style RenderCard fill:#e1ffe1
    style DisplayQuote fill:#e1ffe1
```

## Cache Invalidation Flow

```mermaid
flowchart TD
    Start([Component Mounts]) --> GetToday[Get Today's Date Key]
    GetToday --> GetStored[Get Stored Date Key]
    GetStored --> Compare{Dates Match?}
    
    Compare -->|No Match| ClearAll[Clear All Cache Keys]
    Compare -->|Match| CheckQuote{Quote Exists?}
    
    ClearAll --> ClearDaily[Clear dailyQuote]
    ClearAll --> ClearDailyDate[Clear dailyQuoteDate]
    ClearAll --> ClearDayBased[Clear dayBasedQuote]
    ClearAll --> ClearDayBasedDate[Clear dayBasedQuoteDate]
    ClearAll --> ClearLegacy[Clear quotes-last-fetch]
    
    ClearDaily --> LogClear[Log Cache Cleared]
    ClearDailyDate --> LogClear
    ClearDayBased --> LogClear
    ClearDayBasedDate --> LogClear
    ClearLegacy --> LogClear
    
    LogClear --> LoadFresh[Load Fresh Quote]
    
    CheckQuote -->|Yes| CheckSource{Source is AI?}
    CheckQuote -->|No| LoadFresh
    
    CheckSource -->|Yes| ClearAI[Clear AI Quote Cache]
    CheckSource -->|No| UseCache[Use Cached Quote]
    
    ClearAI --> LoadFresh
    UseCache --> Render[Render Cached Quote]
    LoadFresh --> Render
    
    style ClearAll fill:#ffe1e1
    style LoadFresh fill:#e1f5ff
    style UseCache fill:#e1ffe1
```

## Provider Selection Flow

```mermaid
flowchart TD
    Start([getQuoteByDay Called]) --> GetDate[Get Today's Date Key]
    GetDate --> GetDay[Get Day of Week 0-6]
    
    GetDay -->|0 Sunday| Provider1[DummyJSON]
    GetDay -->|1 Monday| Provider2[ZenQuotes]
    GetDay -->|2 Tuesday| Provider3[Quotable]
    GetDay -->|3 Wednesday| Provider4[FavQs]
    GetDay -->|4 Thursday| Provider5[Stoic Quotes]
    GetDay -->|5 Friday| Provider6[QuoteGarden]
    GetDay -->|6 Saturday| Provider7[Programming Quotes]
    
    Provider1 --> TryProvider[Try Provider.random]
    Provider2 --> TryProvider
    Provider3 --> TryProvider
    Provider4 --> TryProvider
    Provider5 --> TryProvider
    Provider6 --> TryProvider
    Provider7 --> TryProvider
    
    TryProvider --> Success{Success?}
    Success -->|Yes| CacheResult[Cache Quote with Date]
    Success -->|No| Fallback1[DummyJSON]
    
    Fallback1 --> TryFallback[Try Fallback Provider]
    TryFallback --> FallbackSuccess{Success?}
    FallbackSuccess -->|Yes| CacheResult
    FallbackSuccess -->|No| Fallback2[ZenQuotes]
    
    Fallback2 --> TryFallback
    Fallback2 --> Fallback3[Quotable]
    Fallback3 --> TryFallback
    Fallback3 --> Fallback4[FavQs]
    Fallback4 --> TryFallback
    Fallback4 --> Fallback5[QuoteGarden]
    Fallback5 --> TryFallback
    Fallback5 --> Fallback6[Stoic Quotes]
    Fallback6 --> TryFallback
    Fallback6 --> Fallback7[Programming Quotes]
    Fallback7 --> TryFallback
    Fallback7 --> Fallback8[They Said So]
    Fallback8 --> TryFallback
    Fallback8 --> FinalFallback[Final Fallback: getDailyQuote]
    
    FinalFallback --> LocalQuote[Get Local Quote]
    CacheResult --> Return[Return Quote]
    LocalQuote --> Return
    
    style Provider1 fill:#fff4e1
    style Provider2 fill:#e1f5ff
    style Provider3 fill:#e1f5ff
    style Provider4 fill:#e1f5ff
    style Provider5 fill:#e1f5ff
    style Provider6 fill:#e1f5ff
    style Provider7 fill:#e1f5ff
    style FinalFallback fill:#ffe1e1
    style Return fill:#e1ffe1
```

## Quote Selection Algorithm (Local Fallback)

```mermaid
flowchart TD
    Start([getDailyQuote Called]) --> GetToday[Get Today's Date Key]
    GetToday --> CheckCache{Check dailyQuote Cache}
    
    CheckCache -->|Cache Hit & Date Match| ReturnCached[Return Cached Quote]
    CheckCache -->|Cache Miss or Stale| GetPool[Get All Quotes Pool]
    
    GetPool --> Bundled[Bundled Quotes]
    Bundled --> CachedAPI[Cached API Quotes]
    CachedAPI --> UserSaved[User Saved Quotes]
    
    UserSaved --> GetHistory[Get Recent 7-Day History]
    GetHistory --> CountQuotes{Quotes > History + 5?}
    
    CountQuotes -->|Yes| FilterRecent[Filter Out Recent Quotes]
    CountQuotes -->|No| UseAll[Use All Quotes]
    FilterRecent --> CheckMin{Filtered >= 3?}
    
    CheckMin -->|Yes| UseFiltered[Use Filtered Quotes]
    CheckMin -->|No| UseAll
    UseFiltered --> CalculateIndex
    UseAll --> CalculateIndex[Calculate Quote Index]
    
    CalculateIndex --> GetDayOfYear[Get Day of Year]
    GetDayOfYear --> GetYear[Get Year]
    GetYear --> GetMonth[Get Month]
    GetMonth --> GetDay[Get Day]
    GetDay --> CombineFactors[Combine Factors]
    
    CombineFactors --> Hash[Apply Modulo Operation]
    Hash --> SelectIndex[Select Quote by Index]
    SelectIndex --> UpdateCache[Update Cache with Date]
    UpdateCache --> UpdateHistory[Update Quote History]
    UpdateHistory --> ReturnQuote[Return Quote]
    
    ReturnCached --> End([Quote Ready])
    ReturnQuote --> End
    
    style GetPool fill:#e1f5ff
    style CalculateIndex fill:#fff4e1
    style ReturnQuote fill:#e1ffe1
```

## Auto-Refresh Mechanism

```mermaid
flowchart TD
    Start([Component Mounted]) --> WaitHydration{Wait for Hydration}
    WaitHydration -->|Hydrated| SetupInterval[Setup Refresh Checks]
    
    SetupInterval --> ImmediateCheck[Immediate Check 100ms]
    SetupInterval --> HourlyInterval[Hourly Interval Check]
    SetupInterval --> VisibilityListener[Visibility Change Listener]
    SetupInterval --> FocusListener[Window Focus Listener]
    
    ImmediateCheck --> CheckDate1{Date Changed?}
    HourlyInterval --> CheckDate2{Date Changed?}
    VisibilityListener --> CheckDate3{Date Changed?}
    FocusListener --> CheckDate4{Date Changed?}
    
    CheckDate1 -->|Yes| RefreshQuote1[Refresh Quote]
    CheckDate1 -->|No| Wait1[Wait]
    CheckDate2 -->|Yes| RefreshQuote2[Refresh Quote]
    CheckDate2 -->|No| Wait2[Wait Next Hour]
    CheckDate3 -->|Yes| RefreshQuote3[Refresh Quote]
    CheckDate3 -->|No| Wait3[Wait]
    CheckDate4 -->|Yes| RefreshQuote4[Refresh Quote]
    CheckDate4 -->|No| Wait4[Wait]
    
    RefreshQuote1 --> LoadNew[Load New Quote]
    RefreshQuote2 --> LoadNew
    RefreshQuote3 --> LoadNew
    RefreshQuote4 --> LoadNew
    
    LoadNew --> UpdateStore[Update Zustand Store]
    UpdateStore --> UpdateUI[Update UI]
    UpdateUI --> UpdateStreak[Update Reading Streak]
    UpdateStreak --> IncrementRead[Increment Quotes Read]
    
    Wait1 --> End([Monitoring Active])
    Wait2 --> HourlyInterval
    Wait3 --> End
    Wait4 --> End
    IncrementRead --> End
    
    style RefreshQuote1 fill:#e1f5ff
    style RefreshQuote2 fill:#e1f5ff
    style RefreshQuote3 fill:#e1f5ff
    style RefreshQuote4 fill:#e1f5ff
    style LoadNew fill:#e1ffe1
```

## UI Rendering Flow

```mermaid
flowchart TD
    Start([Quote Ready]) --> GetQuote[Get Quote from Store]
    GetQuote --> GetBackground[Get Background Image]
    
    GetBackground --> GetDateKey[Get Date Key]
    GetDateKey --> ConvertSeed[Convert to Picsum Seed]
    ConvertSeed --> LoadImage[Load Picsum Image]
    LoadImage --> ExtractPalette[Extract Color Palette]
    
    ExtractPalette --> CalculateContrast[Calculate Text Contrast]
    CalculateContrast --> CheckMobile{Mobile Device?}
    
    CheckMobile -->|Yes| MobileOverlay[Apply Mobile Overlay 40%]
    CheckMobile -->|No| DesktopOverlay[Apply Desktop Overlay 25%]
    
    MobileOverlay --> WhiteText[Use White Text]
    DesktopOverlay --> WhiteText
    
    WhiteText --> AddShadows[Add Text Shadows]
    AddShadows --> RenderCard[Render Glassmorphism Card]
    
    RenderCard --> RenderCategory[Render Category Badge]
    RenderCategory --> RenderQuote[Render Quote Text]
    RenderQuote --> RenderAuthor[Render Author]
    RenderAuthor --> RenderActions[Render Action Buttons]
    
    RenderActions --> LikeButton[Like Button]
    RenderActions --> SaveButton[Save Button]
    RenderActions --> ShareButton[Share Button]
    RenderActions --> CopyButton[Copy Button]
    RenderActions --> ReadButton[Read Aloud Button]
    RenderActions --> ImageButton[Generate Image Button]
    
    LikeButton --> End([Quote Displayed])
    SaveButton --> End
    ShareButton --> End
    CopyButton --> End
    ReadButton --> End
    ImageButton --> End
    
    style GetBackground fill:#e1f5ff
    style CalculateContrast fill:#fff4e1
    style RenderCard fill:#e1ffe1
    style End fill:#e1ffe1
```

---

## Legend

- **Blue boxes**: Data fetching/processing
- **Yellow boxes**: Decision points/calculations
- **Green boxes**: Successful completion
- **Red boxes**: Fallback/error handling
- **Orange boxes**: Cache operations

---

## Key Insights

1. **Dual-Path Architecture**: Primary path (API) with fallback (local)
2. **Multiple Cache Layers**: Date-based invalidation at multiple levels
3. **Deterministic Selection**: Same quote for all users on same day
4. **Repetition Avoidance**: 7-day history filtering
5. **Auto-Refresh**: Multiple triggers ensure date changes are caught
6. **Graceful Degradation**: Always returns a quote, even if APIs fail

---

**Generated:** 2024-01-15
**Status:** Complete

