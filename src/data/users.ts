// Shared user profiles across Map, Feed, and Messages
export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isFriend: boolean;
  bio: string;
  cardCount: number;
  topCards: string[];
  status?: string; // live status for map
  lat?: number;
  lng?: number;
}

export const USERS: Record<string, UserProfile> = {
  mei: {
    id: 'mei', name: 'Mei', avatar: 'https://i.pravatar.cc/80?img=5',
    isFriend: true, bio: 'Street art hunter. SoHo local.', cardCount: 23,
    topCards: ['Street Art', 'Hidden Cafes', 'Rooftops'],
    status: 'Exploring SoHo', lat: 40.7295, lng: -73.9965,
  },
  jordan: {
    id: 'jordan', name: 'Jordan', avatar: 'https://i.pravatar.cc/80?img=12',
    isFriend: true, bio: 'NYC native. Know every shortcut.', cardCount: 31,
    topCards: ['Urbex', 'Tunnels', 'Bridges'],
    status: 'Near Times Square', lat: 40.7580, lng: -73.9855,
  },
  suki: {
    id: 'suki', name: 'Suki', avatar: 'https://i.pravatar.cc/80?img=9',
    isFriend: true, bio: 'Transit nerd. Every platform has a story.', cardCount: 19,
    topCards: ['Stations', 'Underground', 'Night Walks'],
    status: 'At a hidden café', lat: 40.7282, lng: -73.7949,
  },
  alex: {
    id: 'alex', name: 'Alex', avatar: 'https://i.pravatar.cc/80?img=33',
    isFriend: true, bio: "Foodie. If it's cash only, I'm there.", cardCount: 14,
    topCards: ['Museums', 'Sculptures', 'Galleries'],
    status: 'Wandering Flatiron', lat: 40.7425, lng: -73.9885,
  },
  lina: {
    id: 'lina', name: 'Lina', avatar: 'https://i.pravatar.cc/80?img=1',
    isFriend: false, bio: 'Architecture student. I collect doors.', cardCount: 12,
    topCards: ['Architecture', 'Doors', 'Libraries'],
  },
  tomas: {
    id: 'tomas', name: 'Tomás', avatar: 'https://i.pravatar.cc/80?img=7',
    isFriend: false, bio: 'Photographer & park bench enthusiast.', cardCount: 8,
    topCards: ['Parks', 'Benches', 'Golden Hour'],
  },
  kai: {
    id: 'kai', name: 'Kai', avatar: 'https://i.pravatar.cc/80?img=14',
    isFriend: false, bio: 'Night owl. I find things after dark.', cardCount: 6,
    topCards: ['Night Life', 'Neon', 'Late Eats'],
  },
  priya: {
    id: 'priya', name: 'Priya', avatar: 'https://i.pravatar.cc/80?img=16',
    isFriend: false, bio: "Rooftop collector. Heights don't scare me.", cardCount: 15,
    topCards: ['Rooftops', 'Views', 'Skyline'],
  },
  raven: {
    id: 'raven', name: 'Raven', avatar: 'https://i.pravatar.cc/80?img=20',
    isFriend: false, bio: 'Stairwell explorer & urban spelunker.', cardCount: 9,
    topCards: ['Stairs', 'Abandoned', 'Concrete'],
  },
  dani: {
    id: 'dani', name: 'Dani', avatar: 'https://i.pravatar.cc/80?img=23',
    isFriend: false, bio: 'Late night diner regular. Always booth 4.', cardCount: 4,
    topCards: ['Diners', 'Coffee', '3am Spots'],
  },
  omar: {
    id: 'omar', name: 'Omar', avatar: 'https://i.pravatar.cc/80?img=11',
    isFriend: false, bio: 'Chess player. Washington Square regular.', cardCount: 7,
    topCards: ['Chess', 'Parks', 'Street Games'],
  },
  yuki: {
    id: 'yuki', name: 'Yuki', avatar: 'https://i.pravatar.cc/80?img=25',
    isFriend: false, bio: 'Bookshop cat whisperer.', cardCount: 11,
    topCards: ['Bookshops', 'Cats', 'Quiet Spots'],
  },
  marco: {
    id: 'marco', name: 'Marco', avatar: 'https://i.pravatar.cc/80?img=30',
    isFriend: false, bio: 'Muralist. Colors are my language.', cardCount: 22,
    topCards: ['Murals', 'Color', 'Walls'],
  },
  noor: {
    id: 'noor', name: 'Noor', avatar: 'https://i.pravatar.cc/80?img=32',
    isFriend: false, bio: 'Memory collector. I photograph feelings.', cardCount: 16,
    topCards: ['Memory', 'Light', 'Emotion'],
  },
};

// Card author assignments by card index (for map pins)
export const CARD_AUTHOR_IDS: Record<number, string> = {
  0: 'lina', 1: 'tomas', 2: 'mei', 3: 'kai', 4: 'priya',
  5: 'jordan', 6: 'raven', 7: 'dani', 8: 'suki', 9: 'omar',
  10: 'alex', 11: 'yuki', 12: 'marco', 13: 'noor',
};

// Feed uses a rotating subset of users
export const FEED_USER_IDS = ['mei', 'alex', 'jordan', 'suki', 'lina', 'priya'];

// Friends with live map locations
export const FRIEND_IDS = ['mei', 'jordan', 'suki', 'alex'];

// Helper to get user by id
export function getUser(id: string): UserProfile {
  return USERS[id] || USERS.lina;
}
