import { FunFactResponse } from "../types";

const DEFAULT_FACT: FunFactResponse = { fact: "A wonderful place to visit!", emoji: "🌟" };

const FACTS: Record<string, FunFactResponse> = {
    // --- World ---
    "united states of america": { fact: "Home to the Grand Canyon!", emoji: "🦅" },
    "usa": { fact: "Home to the Grand Canyon!", emoji: "🦅" },
    "china": { fact: "Pandas live here!", emoji: "🐼" },
    "brazil": { fact: "Famous for the Amazon Rainforest!", emoji: "🦜" },
    "australia": { fact: "Kangaroos hop here!", emoji: "🦘" },
    "india": { fact: "Land of tigers and spices!", emoji: "🐅" },
    "canada": { fact: "Lots of snow and maple syrup!", emoji: "🍁" },
    "russia": { fact: "The biggest country in the world!", emoji: "🐻" },
    "france": { fact: "Home of the Eiffel Tower!", emoji: "🥖" },
    "egypt": { fact: "Land of pyramids and pharaohs!", emoji: "🐪" },
    "united kingdom": { fact: "Big Ben clock is here!", emoji: "🏰" },
    "mexico": { fact: "Yummy tacos come from here!", emoji: "🌮" },
    "japan": { fact: "Land of rising sun and sushi!", emoji: "🍣" },
    "germany": { fact: "Famous for fast cars and castles!", emoji: "🏰" },
    "italy": { fact: "Pizza and pasta started here!", emoji: "🍕" },
    "south africa": { fact: "Lions and elephants live here!", emoji: "🦁" },
    "argentina": { fact: "Famous for tango dancing!", emoji: "💃" },
    "saudi arabia": { fact: "Has huge deserts!", emoji: "🏜️" },

    // --- Asia ---
    "thailand": { fact: "Land of smiles and elephants!", emoji: "🐘" },
    "vietnam": { fact: "Famous for noodle soup called Pho!", emoji: "🍜" },
    "indonesia": { fact: "Has thousands of islands!", emoji: "🏝️" },
    "iran": { fact: "Famous for beautiful rugs!", emoji: "🧶" },
    "south korea": { fact: "Famous for K-Pop music!", emoji: "🎵" },
    "north korea": { fact: "A very secretive country.", emoji: "🤫" },
    "pakistan": { fact: "Home to high mountains!", emoji: "🏔️" },
    "afghanistan": { fact: "Famous for delicious pomegranates!", emoji: "🍎" },
    "nepal": { fact: "Home to Mount Everest!", emoji: "🏔️" },
    "bangladesh": { fact: "Land of many rivers!", emoji: "🛶" },
    "sri lanka": { fact: "Famous for tea and beaches!", emoji: "🍵" },
    "malaysia": { fact: "Has tall twin towers!", emoji: "🏙️" },
    "philippines": { fact: "Has beautiful tropical beaches!", emoji: "🏖️" },
    "mongolia": { fact: "Land of blue skies and horses!", emoji: "🐎" },
    "myanmar": { fact: "Land of golden pagodas!", emoji: "a??a??" },
    "israel": { fact: "A tiny country with big history!", emoji: "🕍" },
    "iraq": { fact: "One of the oldest places on Earth!", emoji: "🏺" },
    "turkey": { fact: "Where Europe meets Asia!", emoji: "🕌" },
    "kazakhstan": { fact: "Famous for wild apples!", emoji: "🍎" },

    // --- India States ---
    "maharashtra": { fact: "Home to Bollywood movies!", emoji: "🎬" },
    "delhi": { fact: "The capital city is here!", emoji: "🏛️" },
    "tamil nadu": { fact: "Famous for old temples!", emoji: "🛕" },
    "rajasthan": { fact: "Land of kings and deserts!", emoji: "🐪" },
    "kerala": { fact: "God's own country with boats!", emoji: "🥥" },
    "gujarat": { fact: "Home of Asiatic Lions!", emoji: "🦁" },
    "west bengal": { fact: "Famous for sweet Rosogolla!", emoji: "🍬" },
    "karnataka": { fact: "Silicon Valley of India!", emoji: "💻" },
    "punjab": { fact: "Land of five rivers!", emoji: "🌾" },
    "goa": { fact: "Best beaches for holidays!", emoji: "🏖️" },
    "uttar pradesh": { fact: "Taj Mahal is here!", emoji: "🕌" },
    "bihar": { fact: "Land of Buddha!", emoji: "🧘" },
    "madhya pradesh": { fact: "Heart of India with tigers!", emoji: "🐅" },
    "andhra pradesh": { fact: "Famous for spicy food!", emoji: "🌶️" },
    "telangana": { fact: "Famous for Hyderabadi Biryani!", emoji: "biryani" },
    "odisha": { fact: "Famous for Jagannath Temple!", emoji: "🛕" },
    "assam": { fact: "Famous for tea gardens!", emoji: "🍵" },
    "kashmir": { fact: "Heaven on Earth!", emoji: "🏔️" },
    "jammu and kashmir": { fact: "Beautiful mountains and lakes!", emoji: "🏔️" },
    "ladakh": { fact: "Cold desert with blue lakes!", emoji: "🏍️" },
    "uttarakhand": { fact: "Land of gods and yoga!", emoji: "🧘" },
    "himachal pradesh": { fact: "Famous for apples and snow!", emoji: "🍎" },
    "haryana": { fact: "Land of milk and sports!", emoji: "🥛" },
    "chhattisgarh": { fact: "Full of forests and waterfalls!", emoji: "🌳" },
    "jharkhand": { fact: "Land of forests and minerals!", emoji: "💎" },
    "sikkim": { fact: "First organic state!", emoji: "🌱" },
    "arunachal pradesh": { fact: "Land of the rising sun in India!", emoji: "☀️" },
    "nagaland": { fact: "Land of festivals!", emoji: "🎉" },
    "manipur": { fact: "Jewel of India!", emoji: "💎" },
    "mizoram": { fact: "Land of blue mountains!", emoji: "⛰️" },
    "tripura": { fact: "Famous for bamboo crafts!", emoji: "🎍" },
    "meghalaya": { fact: "Wettest place on Earth!", emoji: "🌧️" }
};

export const getLocalFact = (name: string): FunFactResponse => {
    const key = name.toLowerCase().trim();
    // Direct match
    if (FACTS[key]) return FACTS[key];

    // Partial match check (e.g. if map says "Republic of India" but we have "India")
    const partialMatch = Object.keys(FACTS).find(k => key.includes(k) || k.includes(key));
    if (partialMatch) return FACTS[partialMatch];

    return {
        fact: `Explore beautiful ${name}!`,
        emoji: "🌍"
    };
};
