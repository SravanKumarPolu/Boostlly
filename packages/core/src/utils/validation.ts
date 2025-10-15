import { Quote, User } from "../types";

export class ValidationUtils {
  static isValidQuote(quote: any): quote is Quote {
    return (
      typeof quote === "object" &&
      quote !== null &&
      typeof quote.id === "string" &&
      typeof quote.text === "string" &&
      quote.text.length > 0 &&
      typeof quote.author === "string" &&
      quote.author.length > 0 &&
      typeof quote.category === "string"
    );
  }

  static isValidUser(user: any): user is User {
    return (
      typeof user === "object" &&
      user !== null &&
      typeof user.id === "string" &&
      typeof user.name === "string" &&
      user.name.length > 0 &&
      typeof user.preferences === "object" &&
      typeof user.stats === "object"
    );
  }

  static sanitizeQuoteText(text: string): string {
    return text.trim().replace(/\s+/g, " ");
  }

  static sanitizeAuthorName(name: string): string {
    return name.trim().replace(/\s+/g, " ");
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
