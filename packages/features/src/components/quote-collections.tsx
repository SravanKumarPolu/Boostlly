import { useState, useEffect } from "react";
import {
  Button,
  Badge,
  Input,
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@boostlly/ui";
import { Quote, Source, logError, logDebug, logWarning } from "@boostlly/core";
import { getCategoryDisplay } from "@boostlly/core/utils/category-display";
import {
  FolderOpen,
  Plus,
  Share2,
  Copy,
  Trash2,
  Grid,
  List,
  Download,
  Sparkles,
} from "lucide-react";

interface QuoteCollection {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  quotes: Quote[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  source: Source[];
}

interface QuoteCollectionsProps {
  storage: any;
}

export function QuoteCollections({ storage }: QuoteCollectionsProps) {
  const [collections, setCollections] = useState<QuoteCollection[]>([]);
  const [currentCollection, setCurrentCollection] =
    useState<QuoteCollection | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<Source | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isClient, setIsClient] = useState(false);

  const sources: Source[] = [
    "ZenQuotes",
    "Quotable",
    "FavQs",
    "They Said So",
    "QuoteGarden",
    "DummyJSON",
  ];
  const categories = [
    "motivation",
    "success",
    "leadership",
    "happiness",
    "wisdom",
    "creativity",
    "advice",
    "inspiration",
    "productivity",
    "growth",
    "learning",
    "mindset",
    "positivity",
    "courage",
    "confidence",
    "peace",
    "simplicity",
    "calm",
    "discipline",
    "focus",
    "love",
    "kindness",
    "compassion",
    "purpose",
    "life",
    "resilience",
    "vision",
    "innovation",
    "gratitude",
    "mindfulness",
    "change",
    "adaptability",
    "faith",
    "hope",
  ];

  const defaultCollections: QuoteCollection[] = [
    {
      id: "favorites",
      name: "Favorites",
      description: "Your most loved quotes",
      color: "#EF4444",
      icon: "heart",
      quotes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      tags: ["favorites", "personal"],
      source: sources,
    },
    {
      id: "work",
      name: "Work & Productivity",
      description: "Quotes for professional motivation",
      color: "#3B82F6",
      icon: "target",
      quotes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      tags: ["work", "productivity", "professional"],
      source: sources,
    },
    {
      id: "inspiration",
      name: "Daily Inspiration",
      description: "Quotes to start your day right",
      color: "#10B981",
      icon: "sparkles",
      quotes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      tags: ["inspiration", "daily", "motivation"],
      source: sources,
    },
  ];

  useEffect(() => {
    setIsClient(true);
    loadCollections();
  }, []);

  const loadCollections = async () => {
    if (!isClient) return;

    try {
      const saved = await storage.get("quoteCollections");
      if (saved && Array.isArray(saved)) {
        setCollections(saved);
      } else {
        // Initialize with default collections
        setCollections(defaultCollections);
        await storage.set("quoteCollections", defaultCollections);
      }
    } catch (error) {
      logError("Failed to load collections:", { error: error });
      setCollections(defaultCollections);
    }
  };

  const saveCollections = async (updatedCollections: QuoteCollection[]) => {
    if (!isClient) return;

    try {
      await storage.set("quoteCollections", updatedCollections);
      setCollections(updatedCollections);
    } catch (error) {
      logError("Failed to save collections:", { error: error });
    }
  };

  const createCollection = async (
    name: string,
    description: string,
    color: string,
    tags: string[],
  ) => {
    if (!isClient) return;

    const newCollection: QuoteCollection = {
      id: `collection-${Date.now()}`,
      name,
      description,
      color,
      icon: "folder",
      quotes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      tags,
      source: sources,
    };

    const updatedCollections = [...collections, newCollection];
    await saveCollections(updatedCollections);
    setIsCreating(false);
  };

  // Function to add quote to collection (for future use)
  // const addQuoteToCollection = async (collectionId: string, quote: Quote) => {
  //   const updatedCollections = collections.map(collection => {
  //     if (collection.id === collectionId) {
  //       // Check if quote already exists
  //       const exists = collection.quotes.some(q =>
  //         q.text === quote.text && q.author === quote.author
  //       )
  //       if (!exists) {
  //           return {
  //             ...collection,
  //             quotes: [...collection.quotes, quote],
  //             updatedAt: new Date()
  //           }
  //         }
  //       }
  //       return collection
  //     })
  //     await saveCollections(updatedCollections)
  //   }

  const removeQuoteFromCollection = async (
    collectionId: string,
    quoteIndex: number,
  ) => {
    if (!isClient) return;

    const updatedCollections = collections.map((collection) => {
      if (collection.id === collectionId) {
        const newQuotes = collection.quotes.filter(
          (_, index) => index !== quoteIndex,
        );
        return {
          ...collection,
          quotes: newQuotes,
          updatedAt: new Date(),
        };
      }
      return collection;
    });
    await saveCollections(updatedCollections);
  };

  const deleteCollection = async (collectionId: string) => {
    if (!isClient) return;

    const updatedCollections = collections.filter((c) => c.id !== collectionId);
    await saveCollections(updatedCollections);
    if (currentCollection?.id === collectionId) {
      setCurrentCollection(null);
    }
  };

  const exportCollection = (collection: QuoteCollection) => {
    if (!isClient) return;

    const data = {
      collection: {
        name: collection.name,
        description: collection.description,
        quotes: collection.quotes,
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${collection.name}-quotes.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareCollection = async (collection: QuoteCollection) => {
    if (!isClient) return;

    const shareText = `${collection.name}\n\n${collection.quotes.map((q) => `"${q.text}" — ${q.author}`).join("\n\n")}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: collection.name,
          text: shareText,
        });
      } catch (error) {
        logError("Share failed:", { error: error });
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
    }
  };

  const getFilteredQuotes = () => {
    if (!currentCollection) return [];

    let filtered = currentCollection.quotes;

    if (searchQuery) {
      filtered = filtered.filter(
        (quote) =>
          quote.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (quote.author?.toLowerCase() ?? "").includes(
            searchQuery.toLowerCase(),
          ),
      );
    }

    if (selectedSource !== "all") {
      filtered = filtered.filter((quote) => quote.source === selectedSource);
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (quote) => quote.category === selectedCategory,
      );
    }

    return filtered;
  };

  const getCollectionStats = (collection: QuoteCollection) => {
    const sourceCounts = sources.reduce(
      (acc, source) => {
        acc[source] = collection.quotes.filter(
          (q) => q.source === source,
        ).length;
        return acc;
      },
      {} as Record<Source, number>,
    );

    const categoryCounts = categories.reduce(
      (acc, category) => {
        acc[category] = collection.quotes.filter(
          (q) => q.category === category,
        ).length;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { sourceCounts, categoryCounts };
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Quote Collections
            </h2>
            <p className="text-muted-foreground">
              Organize and manage your favorite quotes
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="bg-background/5 backdrop-blur-sm border border-border"
            >
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-background/10 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-background/10 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Quote Collections
          </h2>
          <p className="text-muted-foreground">
            Organize and manage your favorite quotes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {viewMode === "grid" ? (
              <List className="w-4 h-4" />
            ) : (
              <Grid className="w-4 h-4" />
            )}
            {viewMode === "grid" ? "List" : "Grid"}
          </Button>
          <Button
            onClick={() => setIsCreating(true)}
            variant="gradient"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Collection
          </Button>
        </div>
      </div>

      {/* Collections Grid/List */}
      {!currentCollection && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        >
          {collections.map((collection) => {
            const stats = getCollectionStats(collection);
            const totalQuotes = collection.quotes.length;

            return (
              <Card
                key={collection.id}
                className="bg-background/5 backdrop-blur-sm border border-border hover:border-border transition-all"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: collection.color + "20",
                          border: `1px solid ${collection.color}`,
                        }}
                      >
                        <Sparkles
                          className="w-5 h-5"
                          style={{ color: collection.color }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-foreground text-lg">
                          {collection.name}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                          {totalQuotes} quotes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => setCurrentCollection(collection)}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => shareCollection(collection)}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => exportCollection(collection)}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deleteCollection(collection.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">
                    {collection.description}
                  </p>
                </CardHeader>

                {viewMode === "list" && (
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {collection.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {totalQuotes > 0 && (
                      <div className="mt-4">
                        <p className="text-muted-foreground text-sm mb-2">
                          Top Sources:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(stats.sourceCounts)
                            .filter(([_, count]) => count > 0)
                            .sort(([_, a], [__, b]) => b - a)
                            .slice(0, 3)
                            .map(([source, count]) => (
                              <Badge
                                key={source}
                                variant="glass"
                                className="text-xs"
                              >
                                {source}: {count}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Collection Detail View */}
      {currentCollection && (
        <div className="space-y-6">
          {/* Collection Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setCurrentCollection(null)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to Collections
              </Button>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: currentCollection.color + "20",
                    border: `1px solid ${currentCollection.color}`,
                  }}
                >
                  <Sparkles
                    className="w-6 h-6"
                    style={{ color: currentCollection.color }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {currentCollection.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentCollection.quotes.length} quotes
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => shareCollection(currentCollection)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                onClick={() => exportCollection(currentCollection)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search quotes in collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={selectedSource}
              onChange={(e) =>
                setSelectedSource(e.target.value as Source | "all")
              }
              className="bg-background/5 border border-border rounded-lg px-3 py-2 text-foreground text-sm"
            >
              <option value="all">All Sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-background/5 border border-border rounded-lg px-3 py-2 text-foreground text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {getCategoryDisplay(category)}
                </option>
              ))}
            </select>
          </div>

          {/* Quotes List */}
          <div className="space-y-4">
            {getFilteredQuotes().map((quote, index) => (
              <Card
                key={index}
                className="bg-background/5 backdrop-blur-sm border border-border"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-foreground italic mb-2">
                        "{quote.text}"
                      </p>
                      <p className="text-foreground/80 text-sm">
                        — {quote.author}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        {quote.category && (
                          <Badge variant="glass" className="text-xs">
                            {getCategoryDisplay(quote.category)}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {quote.source}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `"${quote.text}" — ${quote.author}`,
                          )
                        }
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() =>
                          removeQuoteFromCollection(currentCollection.id, index)
                        }
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {getFilteredQuotes().length === 0 && (
              <Alert
                variant="info"
                className="border-blue-500/20 bg-blue-500/10"
              >
                <FolderOpen className="w-4 h-4 text-blue-400" />
                <div>
                  <h4 className="font-medium text-blue-400">No quotes found</h4>
                  <p className="text-sm text-blue-300/80 mt-1">
                    {currentCollection.quotes.length === 0
                      ? "This collection is empty. Add some quotes to get started!"
                      : "Try adjusting your search or filter criteria."}
                  </p>
                </div>
              </Alert>
            )}
          </div>
        </div>
      )}

      {/* Create Collection Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-background/10 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Create New Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CreateCollectionForm
                onCreate={createCollection}
                onCancel={() => setIsCreating(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

interface CreateCollectionFormProps {
  onCreate: (
    name: string,
    description: string,
    color: string,
    tags: string[],
  ) => void;
  onCancel: () => void;
}

function CreateCollectionForm({
  onCreate,
  onCancel,
}: CreateCollectionFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [tags] = useState<string[]>([]);

  const colors = [
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim(), color, tags);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-foreground text-sm font-medium block mb-2">
          Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Collection name"
          className="w-full"
          required
        />
      </div>

      <div>
        <label className="text-foreground text-sm font-medium block mb-2">
          Description
        </label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description"
          className="w-full"
        />
      </div>

      <div>
        <label className="text-foreground text-sm font-medium block mb-2">
          Color
        </label>
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-foreground" : "border-border"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" variant="gradient" className="flex-1">
          Create Collection
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
