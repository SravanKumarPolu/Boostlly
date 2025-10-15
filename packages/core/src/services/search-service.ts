import Fuse, { type IFuseOptions, type FuseResult } from "fuse.js";
import type { Quote, QuoteCollection } from "../types";

export interface SearchResult {
  item: Quote;
  refIndex: number;
  score: number;
}

export interface SearchOptions {
  threshold?: number;
  distance?: number;
  minMatchCharLength?: number;
  keys?: string[];
}

export class SearchService {
  private fuse: Fuse<Quote> | null = null;
  private collections: QuoteCollection[] = [];
  private searchableQuotes: Quote[] = [];

  constructor(collections: QuoteCollection[] = []) {
    this.collections = collections;
  }

  updateData(quotes: Quote[], collections: QuoteCollection[] = []) {
    this.collections = collections;

    // Create searchable data with collection information
    this.searchableQuotes = quotes.map((quote) => ({
      ...quote,
      collections: this.getQuoteCollections(quote.id),
    }));

    // Configure Fuse.js options
    const options: IFuseOptions<Quote> = {
      threshold: 0.3, // Lower = more strict matching
      distance: 100, // How far to look for matches
      minMatchCharLength: 2,
      keys: [
        { name: "text", weight: 0.5 },
        { name: "author", weight: 0.3 },
        { name: "category", weight: 0.2 },
        { name: "collections", weight: 0.1 },
      ],
      includeScore: true,
      includeMatches: true,
    };

    this.fuse = new Fuse(this.searchableQuotes, options);
  }

  search(query: string): SearchResult[] {
    if (!this.fuse || !query.trim()) {
      return [];
    }

    const results = this.fuse.search(query.trim());
    return results.map((result: FuseResult<Quote>) => ({
      item: result.item,
      refIndex: result.refIndex,
      score: result.score || 0,
    }));
  }

  searchByField(
    query: string,
    field: "text" | "author" | "category" | "collections",
  ): SearchResult[] {
    if (!this.fuse || !query.trim()) {
      return [];
    }

    const fieldOptions: IFuseOptions<Quote> = {
      threshold: 0.3,
      distance: 100,
      minMatchCharLength: 2,
      keys: [field],
      includeScore: true,
      includeMatches: true,
    };

    // Use the stored searchable quotes
    const searchableQuotes = this.searchableQuotes;

    const fieldFuse = new Fuse(searchableQuotes, fieldOptions);
    const results = fieldFuse.search(query.trim());

    return results.map((result: FuseResult<Quote>) => ({
      item: result.item,
      refIndex: result.refIndex,
      score: result.score || 0,
    }));
  }

  getSuggestions(query: string, maxSuggestions: number = 5): string[] {
    if (!this.fuse || !query.trim()) {
      return [];
    }

    const results = this.fuse.search(query.trim());
    const suggestions = new Set<string>();

    results.slice(0, maxSuggestions).forEach((result: FuseResult<Quote>) => {
      // Add author suggestions
      if (
        (result.item.author?.toLowerCase() ?? "").includes(query.toLowerCase())
      ) {
        if (result.item.author) suggestions.add(result.item.author);
      }

      // Add category suggestions
      if (
        result.item.category &&
        result.item.category.toLowerCase().includes(query.toLowerCase())
      ) {
        suggestions.add(result.item.category);
      }

      // Add collection suggestions
      const quoteCollections = this.getQuoteCollections(result.item.id);
      quoteCollections.forEach((collection) => {
        if (collection.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(collection);
        }
      });
    });

    return Array.from(suggestions).slice(0, maxSuggestions);
  }

  private getQuoteCollections(quoteId: string): string[] {
    return this.collections
      .filter((collection) => collection.quoteIds.includes(quoteId))
      .map((collection) => collection.name);
  }

  // Advanced search with filters
  advancedSearch(params: {
    query?: string;
    author?: string;
    category?: string;
    collection?: string;
    isLiked?: boolean;
  }): SearchResult[] {
    if (!this.fuse) {
      return [];
    }

    let results = this.searchableQuotes.map((quote: Quote, index: number) => ({
      item: quote,
      refIndex: index,
      score: 0,
    }));

    // Apply filters
    if (params.query) {
      const searchResults = this.search(params.query);
      const searchIds = new Set(searchResults.map((r) => r.item.id));
      results = results.filter((r: SearchResult) => searchIds.has(r.item.id));
    }

    if (params.author) {
      results = results.filter((r: SearchResult) =>
        (r.item.author?.toLowerCase() ?? "").includes(
          params.author!.toLowerCase(),
        ),
      );
    }

    if (params.category) {
      results = results.filter(
        (r: SearchResult) =>
          r.item.category &&
          r.item.category
            .toLowerCase()
            .includes(params.category!.toLowerCase()),
      );
    }

    if (params.collection) {
      results = results.filter((r: SearchResult) => {
        const quoteCollections = this.getQuoteCollections(r.item.id);
        return quoteCollections.some((collection) =>
          collection.toLowerCase().includes(params.collection!.toLowerCase()),
        );
      });
    }

    if (params.isLiked !== undefined) {
      results = results.filter(
        (r: SearchResult) => r.item.isLiked === params.isLiked,
      );
    }

    return results;
  }
}
