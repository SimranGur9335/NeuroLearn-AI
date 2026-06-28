/**
 * Reusable Bookmarking and History Engine
 * Stores items in localStorage, structured for future REST integration.
 */

const BOOKMARKS_KEY = 'neurolearn_career_bookmarks';
const HISTORY_KEY = 'neurolearn_career_history';

export const bookmarkEngine = {
  // Get all bookmarks
  getBookmarks: () => {
    const saved = localStorage.getItem(BOOKMARKS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  },

  // Toggle bookmark
  toggleBookmark: (item) => {
    const bookmarks = bookmarkEngine.getBookmarks();
    const exists = bookmarks.find(b => b.id === item.id && b.type === item.type);
    
    let updated;
    if (exists) {
      updated = bookmarks.filter(b => !(b.id === item.id && b.type === item.type));
    } else {
      updated = [...bookmarks, { ...item, bookmarkedAt: new Date().toISOString() }];
    }
    
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return !exists;
  },

  // Check if bookmarked
  isBookmarked: (id, type) => {
    const bookmarks = bookmarkEngine.getBookmarks();
    return !!bookmarks.find(b => b.id === id && b.type === type);
  },

  // Get recently viewed history
  getHistory: () => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  },

  // Log a view event
  logView: (item) => {
    const history = bookmarkEngine.getHistory();
    // Remove duplication of same item
    const filtered = history.filter(h => !(h.id === item.id && h.type === item.type));
    const updated = [{ ...item, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 10); // cap at 10 items
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }
};
export default bookmarkEngine;
