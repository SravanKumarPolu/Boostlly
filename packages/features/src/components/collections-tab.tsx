import { useState, useEffect } from "react";
import {
  CollectionService,
  useAutoTheme,
  logError,
  logDebug,
  logWarning,
} from "@boostlly/core";
import { Button, Badge, Input } from "@boostlly/ui";
import {
  Plus,
  FolderOpen,
  Edit,
  Trash2,
  X,
  ThumbsUp,
  // Volume2,
  Search,
  Download,
  Upload,
  // Filter,
  FileText,
  FileSpreadsheet,
  FileCode,
  Heart,
  Star,
  Target,
  BookOpen,
  Zap,
  Palette,
} from "lucide-react";
import {
  useCollections,
  useAddCollection,
  useUpdateCollection,
  useRemoveCollection,
  useUpdateCollectionsStreak,
  useUnlockBadge,
  useIncrementCollections,
} from "@boostlly/core";

interface CollectionsTabProps {
  storage?: any;
  savedQuotes?: any[];
  likedQuotes?: any[];
}

// Phase 1: Visual Enhancement Constants
const COLLECTION_COLORS = [
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
];

const COLLECTION_ICONS = {
  folder: FolderOpen,
  heart: Heart,
  star: Star,
  target: Target,
  book: BookOpen,
  zap: Zap,
  bookmark: BookOpen, // Use BookOpen for bookmark icon
};

const COLLECTION_CATEGORIES = [
  "Work",
  "Personal",
  "Motivation",
  "Study",
  "Health",
  "Creativity",
  "Leadership",
  "Success",
];

export function CollectionsTab({
  storage,
  savedQuotes = [],
  likedQuotes = [],
}: CollectionsTabProps) {
  // Zustand store state
  const collections = useCollections();
  const addCollection = useAddCollection();
  const updateCollection = useUpdateCollection();
  const removeCollection = useRemoveCollection();
  const updateCollectionsStreak = useUpdateCollectionsStreak();
  const unlockBadge = useUnlockBadge();
  const incrementCollections = useIncrementCollections();

  // Use auto-theme palette to ensure header text has proper contrast
  const { palette } = useAutoTheme();

  // Local state for UI
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  // const [quotesInCollection, setQuotesInCollection] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("");
  // const [_availableQuotes, setAvailableQuotes] = useState<any[]>([])

  // Phase 2: Data Management features
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterTags, setFilterTags] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Phase 1: Visual Enhancement features
  const [showVisualSettings, setShowVisualSettings] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLLECTION_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState("folder");
  const [selectedCategory, setSelectedCategory] = useState(
    COLLECTION_CATEGORIES[0],
  );

  // Debug logging for visual selections
  useEffect(() => {
    logDebug("Visual Selection Updated:", {
      selectedColor,
      selectedIcon,
      selectedCategory,
    });
  }, [selectedColor, selectedIcon, selectedCategory]);

  const collectionService = storage ? new CollectionService(storage) : null;

  useEffect(() => {
    if (collectionService && collections.length === 0) {
      loadCollections();
    }
  }, [collectionService]);

  useEffect(() => {
    if (selectedCollection && collectionService) {
      loadQuotesInCollection();
    }
  }, [selectedCollection, savedQuotes]);

  // Phase 1: Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    const IconComponent =
      COLLECTION_ICONS[iconName as keyof typeof COLLECTION_ICONS] || FolderOpen;
    return <IconComponent className="w-4 h-4" />;
  };

  async function loadCollections() {
    if (!collectionService) return;
    try {
      const allCollections = await collectionService.getAllCollections();
      // Update store with collections
      allCollections.forEach((collection) => {
        addCollection(collection);
      });
    } catch (error) {
      logError("Failed to load collections:", { error: error });
    }
  }

  async function loadQuotesInCollection() {
    if (!collectionService || !selectedCollection) return;
    try {
      // const quotes = await collectionService.getQuotesInCollection(selectedCollection.id, savedQuotes)
      // setQuotesInCollection(quotes) // Commented out since quotesInCollection is not used
    } catch (error) {
      logError("Failed to load quotes in collection:", { error: error });
    }
  }

  async function handleCreateCollection() {
    if (!collectionService || !newName.trim()) return;
    try {
      const newCollection = await collectionService.createCollection(
        newName.trim(),
        newDescription.trim(),
        {
          color: selectedColor,
          icon: selectedIcon,
          category: selectedCategory,
        },
      );
      if (newCollection) {
        addCollection(newCollection);
        incrementCollections();
        updateCollectionsStreak();
        unlockBadge("quote-collector");
        setNewName("");
        setNewDescription("");
        setSelectedColor(COLLECTION_COLORS[0]);
        setSelectedIcon("folder");
        setSelectedCategory(COLLECTION_CATEGORIES[0]);
        setShowCreate(false);
      }
    } catch (error) {
      logError("Failed to create collection:", { error: error });
    }
  }

  async function handleUpdateCollection() {
    if (!collectionService || !selectedCollection || !editName.trim()) return;
    try {
      const updatedCollection = await collectionService.updateCollection(
        selectedCollection.id,
        {
          name: editName.trim(),
          description: editDescription.trim(),
          color: selectedColor,
          icon: selectedIcon,
          category: selectedCategory,
        },
      );
      if (updatedCollection) {
        updateCollection(selectedCollection.id, {
          name: editName.trim(),
          description: editDescription.trim(),
          color: selectedColor,
          icon: selectedIcon,
          category: selectedCategory,
        });
        setEditName("");
        setEditDescription("");
        setShowEdit(false);
        setSelectedCollection(null);
      }
    } catch (error) {
      logError("Failed to update collection:", { error: error });
    }
  }

  async function handleDeleteCollection() {
    if (!collectionService || !selectedCollection) return;
    try {
      await collectionService.deleteCollection(selectedCollection.id);
      removeCollection(selectedCollection.id);
      setSelectedCollection(null);
      setShowEdit(false);
    } catch (error) {
      logError("Failed to delete collection:", { error: error });
    }
  }

  async function handleAddQuoteToCollection(quoteId: string) {
    if (!collectionService || !selectedCollection) return;
    try {
      await collectionService.addQuoteToCollection(
        selectedCollection.id,
        quoteId,
      );
      const updatedCollection = await collectionService.getCollection(
        selectedCollection.id,
      );
      if (updatedCollection) {
        updateCollection(selectedCollection.id, updatedCollection);
        loadQuotesInCollection();
      }
    } catch (error) {
      logError("Failed to add quote to collection:", { error: error });
    }
  }

  // async function _handleRemoveQuoteFromCollection(quoteId: string) {
  //   if (!collectionService || !selectedCollection) return
  //   try {
  //     await collectionService.removeQuoteFromCollection(selectedCollection.id, quoteId)
  //     const updatedCollection = await collectionService.getCollection(selectedCollection.id)
  //     if (updatedCollection) {
  //       updateCollection(selectedCollection.id, updatedCollection)
  //     loadQuotesInCollection()
  //     }
  //   } catch (error) {
  //     logError('Failed to remove quote from collection:', { error: error })
  //   }
  // }

  // Phase 2: Export/Import Functions
  async function handleExport(format: "json" | "csv" | "txt") {
    if (!collectionService) return;
    try {
      let data: string;
      let filename: string;
      let mimeType: string;

      if (format === "json") {
        data = await collectionService.exportCollectionsAsJSON();
        filename = `boostlly-collections-${new Date().toISOString().split("T")[0]}.json`;
        mimeType = "application/json";
      } else if (format === "csv") {
        data = await collectionService.exportCollectionsAsCSV();
        filename = `boostlly-collections-${new Date().toISOString().split("T")[0]}.csv`;
        mimeType = "text/csv";
      } else {
        data = await collectionService.exportCollectionsAsPDF();
        filename = `boostlly-collections-${new Date().toISOString().split("T")[0]}.html`;
        mimeType = "text/html";
      }

      // Create and download file
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExport(false);
    } catch (error) {
      logError("Failed to export collections:", { error: error });
      alert("Failed to export collections. Please try again.");
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    if (!collectionService || !event.target.files?.[0]) return;
    try {
      const file = event.target.files[0];
      const text = await file.text();

      await collectionService.importCollectionsFromJSON(text);

      // Reload collections
      await loadCollections();

      setShowImport(false);
      alert("Collections imported successfully!");
    } catch (error) {
      logError("Failed to import collections:", { error: error });
      alert("Failed to import collections. Please check the file format.");
    }
  }

  // Phase 2: Search & Filter Functions
  function getFilteredCollections() {
    let filtered = collections;

    // Search by name or description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (collection) =>
          collection.name.toLowerCase().includes(query) ||
          collection.description?.toLowerCase().includes(query),
      );
    }

    // Filter by type (default vs custom)
    if (filterType !== "all") {
      if (filterType === "default") {
        filtered = filtered.filter((collection) => collection.isDefault);
      } else if (filterType === "custom") {
        filtered = filtered.filter((collection) => !collection.isDefault);
      }
    }

    return filtered;
  }

  // function getFilteredQuotes(quotes: any[]) {
  //   let filtered = quotes

  //   // Filter by author
  //   if (filterAuthor.trim()) {
  //     const author = filterAuthor.toLowerCase()
  //     filtered = filtered.filter(quote =>
  //       quote.author?.toLowerCase().includes(author)
  //     )
  //   }

  //   // Filter by tags (if quotes have tags)
  //   if (filterTags.trim()) {
  //     const tags = filterTags.toLowerCase().split(',').map(tag => tag.trim())
  //     filtered = filtered.filter(quote =>
  //       quote.tags?.some((tag: string) =>
  //         tags.some(filterTag => tag.toLowerCase().includes(filterTag))
  //       )
  //     )
  //   }

  //   return filtered
  // }

  const filteredCollections = getFilteredCollections();
  const totalQuotes = collections.reduce(
    (sum, collection) => sum + collection.quoteIds.length,
    0,
  );
  const likedQuotesCount = likedQuotes.length;

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2
            className="text-3xl font-bold"
            style={{ color: palette?.fg || "hsl(var(--foreground))" }}
          >
            Collections
          </h2>
          <p
            className="mt-1"
            style={{ color: palette?.fg || "hsl(var(--foreground))" }}
          >
            Organize and discover your favorite quotes
          </p>
        </div>
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
          {/* Phase 2: Data Management Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearch(true)}
            className="text-xs"
            style={{
              color: palette?.fg || "hsl(var(--foreground))",
              borderColor: palette?.fg || "hsl(var(--border))",
            }}
          >
            <Search
              className="w-3 h-3 mr-1"
              style={{ color: palette?.fg || "hsl(var(--foreground))" }}
            />
            Search
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExport(true)}
            className="text-xs"
            style={{
              color: palette?.fg || "hsl(var(--foreground))",
              borderColor: palette?.fg || "hsl(var(--border))",
            }}
          >
            <Download
              className="w-3 h-3 mr-1"
              style={{ color: palette?.fg || "hsl(var(--foreground))" }}
            />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImport(true)}
            className="text-xs"
            style={{
              color: palette?.fg || "hsl(var(--foreground))",
              borderColor: palette?.fg || "hsl(var(--border))",
            }}
          >
            <Upload
              className="w-3 h-3 mr-1"
              style={{ color: palette?.fg || "hsl(var(--foreground))" }}
            />
            Import
          </Button>
          {/* Phase 1: Visual Enhancement Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVisualSettings(true)}
            className="text-xs"
            style={{
              color: palette?.fg || "hsl(var(--foreground))",
              borderColor: palette?.fg || "hsl(var(--border))",
            }}
          >
            <Palette
              className="w-3 h-3 mr-1"
              style={{ color: palette?.fg || "hsl(var(--foreground))" }}
            />
            Visual
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Create
          </Button>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-6 bg-card rounded-2xl border border-border transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-foreground" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{collections.length}</h3>
            <p className="text-muted-foreground text-sm">Collections</p>
            <div className="mt-3 text-xs text-muted-foreground">
              {collections.length > 0
                ? `${collections.filter((c) => c.isDefault).length} default, ${collections.filter((c) => !c.isDefault).length} custom`
                : "Start organizing"}
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-6 bg-card rounded-2xl border border-border transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-foreground" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{totalQuotes}</h3>
            <p className="text-muted-foreground text-sm">Total Quotes</p>
            <div className="mt-3 text-xs text-muted-foreground">
              {totalQuotes > 0
                ? `Across ${collections.length} collections`
                : "Add quotes to collections"}
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-6 bg-card rounded-2xl border border-border transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-foreground" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{likedQuotesCount}</h3>
            <p className="text-muted-foreground text-sm">Liked Quotes</p>
            <div className="mt-3 text-xs text-muted-foreground">
              {likedQuotesCount > 0
                ? "Your favorite quotes"
                : "Like quotes to see them here"}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Collections List */}
      <div className="space-y-4">
        {filteredCollections.length === 0 ? (
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <FolderOpen className="w-12 h-12 text-purple-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">No collections yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first collection to start organizing your favorite
              quotes. Choose from templates or create a custom collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => setShowCreate(true)}
                className="group"
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                Create Collection
              </Button>
            </div>
          </div>
        ) : (
          filteredCollections.map((collection) => (
            <div
              key={collection.id}
              className={`relative group p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                selectedCollection?.id === collection.id
                  ? "bg-accent border-border"
                  : "bg-card border-border hover:bg-accent/40"
              }`}
              style={{
                borderLeftColor: collection.color || "#6B7280",
                borderLeftWidth: "4px",
              }}
              onClick={() => setSelectedCollection(collection)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: (collection.color || "#6B7280") + "20",
                      }}
                    >
                      {getIconComponent(collection.icon || "folder")}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {collection.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {collection.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            Default
                          </Badge>
                        )}
                        {collection.category && (
                          <Badge variant="glass" className="text-xs">
                            {collection.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {collection.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {collection.quoteIds.length} quotes
                  </p>
                </div>
                {selectedCollection?.id === collection.id && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditName(collection.name);
                        setEditDescription(collection.description || "");
                        setSelectedColor(
                          collection.color || COLLECTION_COLORS[0],
                        );
                        setSelectedIcon(collection.icon || "folder");
                        setSelectedCategory(
                          collection.category || COLLECTION_CATEGORIES[0],
                        );
                        setShowEdit(true);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    {!collection.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCollection();
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreate && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="w-full max-w-md p-4 rounded-xl border border-border bg-background/10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Create Collection
              </h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Collection name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-background/10 border-border text-foreground placeholder-muted-foreground/50"
              />
              <Input
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="bg-background/10 border-border text-foreground placeholder-muted-foreground/50"
              />

              {/* Phase 1: Visual Enhancement Options */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLLECTION_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? "border-foreground scale-110"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(COLLECTION_ICONS).map(
                    ([name, IconComponent]) => (
                      <button
                        key={name}
                        onClick={() => setSelectedIcon(name)}
                        className={`p-2 rounded-lg border transition-all ${
                          selectedIcon === name
                            ? "border-foreground bg-background/10"
                            : "border-border bg-background/5 hover:bg-accent"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 text-foreground" />
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 bg-background/10 rounded border border-border text-foreground text-sm"
                >
                  {COLLECTION_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={handleCreateCollection} className="w-full">
                Create Collection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Collection Modal */}
      {showEdit && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="w-full max-w-md p-4 rounded-xl border border-border bg-background/10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Edit Collection
              </h3>
              <button
                onClick={() => setShowEdit(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Collection name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-background/10 border-border text-foreground placeholder-muted-foreground/50"
              />
              <Input
                placeholder="Description (optional)"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-background/10 border-border text-foreground placeholder-muted-foreground/50"
              />

              {/* Phase 1: Visual Enhancement Options */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLLECTION_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? "border-foreground scale-110"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(COLLECTION_ICONS).map(
                    ([name, IconComponent]) => (
                      <button
                        key={name}
                        onClick={() => setSelectedIcon(name)}
                        className={`p-2 rounded-lg border transition-all ${
                          selectedIcon === name
                            ? "border-foreground bg-background/10"
                            : "border-border bg-background/5 hover:bg-accent"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 text-foreground" />
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 bg-background/10 rounded border border-border text-foreground text-sm"
                >
                  {COLLECTION_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateCollection} className="flex-1">
                  Update Collection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEdit(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Quote to Collection Modal */}
      {showAddQuote && selectedCollection && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="w-full max-w-2xl p-4 rounded-xl border border-border bg-background/10 backdrop-blur-xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Add Quote to {selectedCollection.name}
              </h3>
              <button
                onClick={() => setShowAddQuote(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {savedQuotes
                .filter(
                  (quote) => !selectedCollection.quoteIds.includes(quote.id),
                )
                .map((quote) => (
                  <div
                    key={quote.id}
                    className="p-3 bg-background/5 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => handleAddQuoteToCollection(quote.id)}
                  >
                    <p className="text-sm text-foreground">{quote.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      - {quote.author}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: Export Modal */}
      {showExport && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="w-full max-w-md p-4 rounded-xl border border-border bg-background/10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Export Collections
              </h3>
              <button
                onClick={() => setShowExport(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleExport("json")}
                className="w-full p-3 bg-background/5 rounded-lg border border-border hover:bg-accent transition-colors flex items-center gap-3"
              >
                <FileCode className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <div className="text-sm font-medium text-foreground">
                    Export as JSON
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Complete data with metadata
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleExport("csv")}
                className="w-full p-3 bg-background/5 rounded-lg border border-border hover:bg-accent transition-colors flex items-center gap-3"
              >
                <FileSpreadsheet className="w-5 h-5 text-green-400" />
                <div className="text-left">
                  <div className="text-sm font-medium text-foreground">
                    Export as CSV
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Spreadsheet-friendly format
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleExport("txt")}
                className="w-full p-3 bg-background/5 rounded-lg border border-border hover:bg-accent transition-colors flex items-center gap-3"
              >
                <FileText className="w-5 h-5 text-red-400" />
                <div className="text-left">
                  <div className="text-sm font-medium text-foreground">
                    Export as HTML
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Printable report format
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: Import Modal */}
      {showImport && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="w-full max-w-md p-4 rounded-xl border border-border bg-background/10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Import Collections
              </h3>
              <button
                onClick={() => setShowImport(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-background/5 rounded-lg border border-border">
                <p className="text-sm text-foreground/80 mb-3">
                  Select a JSON file to import collections:
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-background/10 file:text-foreground hover:file:bg-background/20"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: Search & Filter Modal */}
      {showSearch && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="w-full max-w-md p-4 rounded-xl border border-border bg-background/10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Search & Filter
              </h3>
              <button
                onClick={() => setShowSearch(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Search Collections
                </label>
                <Input
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background/10 border-border text-foreground placeholder-muted-foreground/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Filter by Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-2 bg-background/10 rounded border border-border text-foreground text-sm"
                >
                  <option value="all">All Collections</option>
                  <option value="default">Default Collections</option>
                  <option value="custom">Custom Collections</option>
                </select>
              </div>
              {selectedCollection && (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Filter by Author
                    </label>
                    <Input
                      placeholder="Search by author..."
                      value={filterAuthor}
                      onChange={(e) => setFilterAuthor(e.target.value)}
                      className="bg-background/10 border-border text-foreground placeholder-muted-foreground/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Filter by Tags
                    </label>
                    <Input
                      placeholder="Search by tags (comma-separated)..."
                      value={filterTags}
                      onChange={(e) => setFilterTags(e.target.value)}
                      className="bg-background/10 border-border text-foreground placeholder-muted-foreground/50"
                    />
                  </div>
                </>
              )}
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                  setFilterAuthor("");
                  setFilterTags("");
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 1: Visual Settings Modal */}
      {showVisualSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="w-full max-w-md p-4 rounded-xl border border-border bg-background/10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Visual Organization
              </h3>
              <button
                onClick={() => setShowVisualSettings(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Collection Colors
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Color-code your collections for quick visual identification
                </p>
                <div className="flex gap-2 flex-wrap">
                  {COLLECTION_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                        selectedColor === color
                          ? "border-foreground scale-110"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Collection Icons
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Choose from various icons to represent different collection
                  types
                </p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(COLLECTION_ICONS).map(
                    ([name, IconComponent]) => (
                      <button
                        key={name}
                        onClick={() => setSelectedIcon(name)}
                        className={`p-2 rounded-lg border transition-all hover:scale-110 ${
                          selectedIcon === name
                            ? "border-foreground bg-background/10 scale-110"
                            : "border-border bg-background/5 hover:bg-accent"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 text-foreground" />
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Collection Categories
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Organize collections by type for better filtering
                </p>
                <div className="flex gap-1 flex-wrap">
                  {COLLECTION_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all hover:scale-105 ${
                        selectedCategory === category
                          ? "border-foreground bg-background/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-border"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-3">
                  <strong>Current Selection:</strong>
                  <br />
                  Color: <span style={{ color: selectedColor }}>●</span>{" "}
                  {selectedColor}
                  <br />
                  Icon: {selectedIcon}
                  <br />
                  Category: {selectedCategory}
                </p>
              </div>

              <Button
                onClick={() => setShowVisualSettings(false)}
                className="w-full"
              >
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
