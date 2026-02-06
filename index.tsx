import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Smile, Zap, Compass, User, MessageSquare, Menu, Globe, LogIn, ChevronRight, HardDrive, Cpu, Lightbulb } from 'lucide-react';

// --- CONFIGURATION ---
const BOT_NAMES = {
  ASSISTANT: 'Aura (Assistant)',
  PLAN: 'Forge (Planner)',
  AGENT: 'Phantom (Agent)',
  LOCAL: 'Local (Client-Side)',
};

const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';
const API_KEY = ""; // Canvas environment provides this if empty

// Define default theme styles for different OS/device types
const IOS_THEME = { primaryBg: 'bg-gray-100', primaryText: 'text-gray-900', accent: 'text-blue-600', isDark: false };
const ANDROID_THEME = { primaryBg: 'bg-gray-900', primaryText: 'text-white', accent: 'text-teal-400', isDark: true };
const WINDOWS_THEME = { primaryBg: 'bg-zinc-800', primaryText: 'text-gray-100', accent: 'text-sky-400', isDark: true };

// Default config (used if detection fails)
const INITIAL_SERVER_CONFIG = {
  layout: 'Outside',
  theme: IOS_THEME, // Default to iOS look for general web
  title: 'AI Assistant',
};

// Simulated tool definitions (mocking the server response logic)
const TOOL_DEFINITIONS = {
  '/login': { type: 'modal', name: 'User Login' },
  '/dictionary': { type: 'redirect', name: 'Dictionary Service', url: '/dictionary' },
  '/weather': { type: 'redirect', name: 'Weather Forecast', url: '/weather' },
  '/admin': { type: 'redirect', name: 'Admin Dashboard', url: '/admin' },
};

// --- UTILITY FUNCTIONS & SIMULATIONS ---

/**
 * Implements exponential backoff retry mechanism for API calls.
 */
const fetchWithRetry = async (url: string, options?: RequestInit, maxRetries: number = 5): Promise<Response> => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            // Throw error for non-successful response to trigger retry, unless it's a 4xx client error
            if (response.status >= 500 || response.status === 429) {
                throw new Error(`Server error or rate limit: ${response.status}`);
            } else {
                 // For other client errors (e.g., 400 Bad Request), stop and report immediately
                const errorBody = await response.json();
                console.error("Non-retryable API Error:", errorBody);
                throw new Error(`API Error: ${response.status} - ${errorBody.error.message}`);
            }
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error; // Last attempt, throw the error
            }
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000; // Exponential backoff with jitter
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

/**
 * Makes the actual call to the Gemini API for text generation.
 * @param {string} prompt The user's query.
 * @param {string} systemPrompt The instruction to guide the model's persona.
 * @param {boolean} useGrounding Whether to enable Google Search grounding.
 * @returns {{text: string, sources: Array<{uri: string, title: string}>}}
 */
const callGeminiAPI = async (prompt, systemPrompt, useGrounding = true) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    if (useGrounding) {
        payload.tools = [{ "google_search": {} }];
    }

    try {
        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            const text = candidate.content.parts[0].text;
            let sources = [];
            const groundingMetadata = candidate.groundingMetadata;

            if (groundingMetadata && groundingMetadata.groundingAttributions) {
                sources = groundingMetadata.groundingAttributions
                    .map(attribution => ({
                        uri: attribution.web?.uri,
                        title: attribution.web?.title,
                    }))
                    .filter(source => source.uri && source.title);
            }

            return { text, sources };
        } else {
            console.error("API response missing text or candidate:", result);
            return { text: "Error: The AI model returned an unexpected or empty response.", sources: [] };
        }

    } catch (error) {
        console.error('Gemini API Error:', error);
        return { text: `Error calling Gemini API: ${error.message}. Please check console for details.`, sources: [] };
    }
};

/**
 * Mocks the asynchronous loading and initialization of a transformers.js pipeline.
 */
const initializeLocalPipeline = async () => {
  console.log("Starting to load local transformer model (simulated)...");
  // Simulate model download and WASM compilation delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  const mockPipeline = {
    task: 'text-generation',
    // Mock the run/generate method for local inference
    generate: async (text) => {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate very fast local inference latency
      const tokenCount = Math.floor(text.length * 2.5);
      const responseText = `[Client-Side LLM] Processed ${tokenCount} tokens locally. Your query was run entirely in your browser using a client-side model.`;
      return {
        text: responseText,
        local_tokens: tokenCount,
      };
    }
  };

  console.log("Local model loaded successfully.");
  return mockPipeline;
};


/**
 * Simulates environment detection (OS, Browser, Screen Size).
 */
const detectEnvironment = () => {
  const userAgent = navigator.userAgent;
  let os = 'Unknown OS';
  if (userAgent.includes('Win')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  const browser = (function() {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other Browser';
  })();

  return {
    os,
    browser,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    deviceType: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
    ipAddress: '192.168.1.1',
    headers: { 'user-agent': userAgent, 'accept-language': navigator.language },
  };
};

/**
 * Simulates the "crazy code" to derive a palette from the environment.
 */
const calculatePalette = (env) => {
  const hour = new Date().getHours();
  const accentColors = ['text-sky-500', 'text-indigo-500', 'text-cyan-500', 'text-purple-500'];

  return {
    primaryBg: INITIAL_SERVER_CONFIG.theme.primaryBg,
    primaryText: INITIAL_SERVER_CONFIG.theme.primaryText,
    accent: accentColors[hour % accentColors.length],
  };
};

/**
 * Simulates an API call to the server to fetch the required UI configuration.
 * This now adapts based on the current layout and login status.
 */
const fetchServerUI = async (env, currentLayout, isLoggedIn) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency

  let themeConfig = INITIAL_SERVER_CONFIG.theme;
  let title = INITIAL_SERVER_CONFIG.title;
  let responseMode = currentLayout + (isLoggedIn ? ' Logged in' : ''); // Derive full mode string

  // 1. Base theme based on OS/Device
  if (env.os === 'iOS' || (env.os === 'macOS' && env.deviceType === 'Mobile')) {
    themeConfig = IOS_THEME;
    title = 'AI Assistant (iOS)';
  } else if (env.os === 'Android') {
    themeConfig = ANDROID_THEME;
    title = 'AI Assistant (Android)';
  } else if (env.os === 'Windows' || (env.os === 'macOS' && env.deviceType === 'Desktop') || env.os === 'Linux') {
    themeConfig = WINDOWS_THEME;
    title = 'AI Assistant (Desktop)';
  }

  // 2. Custom server adaptation based on Layout and Login status
  if (currentLayout === 'Inside') {
    if (isLoggedIn) {
        // INSIDE LOGGED IN: Force Dark/Windows theme for Internal Secure Console
        themeConfig = WINDOWS_THEME;
        title = `Internal Console (Secure)`;
    } else {
        // INSIDE ANONYMOUS: Should be blocked, but if it happens, give a generic look
        themeConfig = IOS_THEME;
        title = `Internal Console (Public)`;
    }
  } else {
    // OUTSIDE Modes: Use the OS/Device based theme from step 1, but update title
    title = `AI Assistant (${isLoggedIn ? 'Secure' : 'Public'})`;
  }

  return { layout: responseMode, theme: themeConfig, title: title, uiHint: `${env.os} components requested in ${responseMode} mode` };
};


/**
 * Core function to handle LLM/VDB interaction. Uses Gemini API for remote modes.
 */
const processLLMInteraction = async (prompt, botMode, isOnline, localVDB) => {
  const embedding = Array.from({ length: 8 }, () => Math.random().toFixed(4));
  const newVDBEntry = { prompt, embedding, timestamp: Date.now() };

  if (botMode === BOT_NAMES.LOCAL) {
      // Offline/Local response simulation (simulated transformers.js pipeline)
      let answerText = `[Offline - ${botMode}] I am currently offline. `;
      if (localVDB.length > 0) {
        const bestMatch = localVDB.slice(-1)[0];
        answerText += `However, based on the last stored vector (ID: ${bestMatch.timestamp}), I can infer a response: "${bestMatch.prompt.substring(0, 30)}..."`;
      } else {
        answerText += 'My local data is empty. I cannot generate a deep response.';
      }
      return { text: answerText, newVDBEntry: newVDBEntry };

  } else {
      // Remote/Server LLM interaction (Real Gemini API call)
      if (!isOnline) {
          return { text: `[Offline - ${botMode}] Cannot connect to remote LLM (Gemini API) while offline.`, newVDBEntry: null };
      }

      const systemPrompt = `You are an AI with a specific persona. Your name is ${botMode}.
      - As 'Aura (Assistant)', be helpful, conversational, and grounded.
      - As 'Forge (Planner)', be structured, methodical, and focus on steps/milestones.
      - As 'Phantom (Agent)', be concise, action-oriented, and technical.
      Always respond in character. Keep your response under 200 words.`;

      const geminiResponse = await callGeminiAPI(prompt, systemPrompt, true); // Use grounding for remote modes

      // Return the LLM-generated text and a new VDB entry (mocking storage)
      return {
          text: geminiResponse.text,
          newVDBEntry: newVDBEntry,
          sources: geminiResponse.sources,
      };
  }
};


/**
 * Simulates storage of the first user visit data.
 */
const storeFirstVisitData = (envData) => {
  const sessionId = 'user-' + Date.now();
  const userData = {
    sessionId,
    loginTimestamp: new Date().toISOString(),
    ...envData,
    initialEmbedding: Array.from({ length: 8 }, () => Math.random().toFixed(4)),
    isLoggedIn: true,
  };

  localStorage.setItem('local_vdb', JSON.stringify([{
    prompt: 'Initial User Profile',
    embedding: userData.initialEmbedding,
    timestamp: Date.now(),
  }]));
  localStorage.setItem('sqlite_user_record', JSON.stringify(userData));
  localStorage.setItem('user_session_id', sessionId);
  sessionStorage.setItem('is_logged_in', 'true');

  console.log('First visit data stored successfully.', userData);
  return userData;
};

// --- REACT COMPONENTS ---

const LoginModal = ({ onClose, onSuccess, theme }) => {
  const accentColor = theme.accent.replace('text-', 'bg-');
  const isDark = theme.isDark;

  const cardStyle = isDark
    ? 'bg-gray-800 border-gray-700 text-gray-100'
    : 'bg-white bg-opacity-90 backdrop-blur-md border border-gray-200 text-gray-900';
  const buttonCancelStyle = isDark
    ? 'bg-gray-700 hover:bg-gray-600 text-white'
    : 'bg-gray-300 hover:bg-gray-400 text-gray-900';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md p-6 rounded-xl shadow-2xl ${cardStyle}`}>
        <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Login/Auth Modal</h2>
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          This modal adapts its theme based on the detected environment.
        </p>
        <div className="flex justify-end space-x-3 pt-4 border-t border-current border-opacity-20">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition duration-150 ${buttonCancelStyle}`}
          >
            Cancel
          </button>
          <button
            onClick={onSuccess}
            className={`px-4 py-2 ${accentColor} text-white rounded-lg font-medium shadow-md hover:opacity-90 active:shadow-none transition duration-150`}
          >
            Authenticate (Mock)
          </button>
        </div>
      </div>
    </div>
  );
};

const PublicTimeline = ({ chatHistory, theme }) => {
  const accentColor = theme.accent.replace('text-', 'bg-');
  const isDark = theme.isDark;

  // Find user-bot conversation pairs for the timeline
  const conversationPairs = [];
  for (let i = 0; i < chatHistory.length; i++) {
    const current = chatHistory[i];
    const next = chatHistory[i + 1];

    if (current.role === 'user' && next?.role === 'bot') {
      conversationPairs.push({
        user: current,
        bot: next,
      });
      i++;
    }
  }

  // Show last 3 pairs
  const items = conversationPairs.slice(-3).reverse();

  const cardStyle = isDark
    ? 'bg-gray-800 border-gray-700 text-gray-100 shadow-xl'
    : 'backdrop-blur-md bg-white bg-opacity-80 border border-gray-200 shadow-xl';
  const textStyle = isDark ? 'text-gray-300' : 'text-gray-700';
  const lineStyle = isDark ? 'border-gray-600' : 'border-gray-300';
  const hoverStyle = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';


  return (
    <div className={`p-4 rounded-xl max-h-64 overflow-y-auto ${cardStyle}`}>
      <h3 className={`flex items-center text-sm font-semibold mb-3 border-b ${lineStyle} pb-1 ${textStyle}`}>
        <Globe className={`w-4 h-4 mr-2 ${theme.accent}`} />
        Public Chat Timeline (Mock)
      </h3>
      {items.length === 0 ? (
        <p className={`text-xs italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>No public interactions yet.</p>
      ) : (
        items.map((pair, index) => (
          <div key={index} className={`mb-3 p-2 rounded-lg transition-all duration-300 cursor-pointer ${hoverStyle}`}>
            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} opacity-90`}>
              {new Date(pair.user.timestamp).toLocaleTimeString()} - User ID: {pair.user.userId?.substring(0, 8) || 'anon'}...
            </p>
            <div className="flex items-start mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${accentColor} flex-shrink-0 mt-1 mr-2`}></div>
              <p className={`text-sm font-light leading-snug ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{pair.user.prompt}</p>
            </div>
            <p className={`text-xs italic mt-1 ml-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              <MessageSquare className="inline w-3 h-3 mr-1" />
              Bot reply seen: "{pair.bot.response?.substring(0, 40) || '[No response]'}..."
            </p>
          </div>
        ))
      )}
    </div>
  );
};

const MainOutputArea = ({ title, chatHistory, responseMode, theme, isLoggedIn, isLocalModelReady, setInputPrompt }) => {
  const accentClass = theme.accent;
  const primaryTextClass = theme.primaryText;
  const isDark = theme.isDark;

  // Define user/bot bubble styles based on theme
  const userBubbleBg = isDark ? 'bg-blue-700' : `${theme.accent.replace('text-', 'bg-')} bg-opacity-90`;
  const userBubbleText = 'text-white';
  const botBubbleBg = isDark ? 'bg-gray-700' : 'bg-white bg-opacity-90 border border-gray-200';
  const botBubbleText = isDark ? 'text-gray-100' : 'text-gray-900';
  const botRoleText = isDark ? 'text-gray-300' : 'text-gray-600';

  // LLM Powered Feature Button
  const analyzeButton = (
    <button
      onClick={() => setInputPrompt('/analyze')}
      className={`mt-4 px-4 py-2 rounded-full font-bold text-sm shadow-lg transform active:scale-95 transition-all duration-150 ${accentClass.replace('text-', 'bg-')} text-white flex items-center justify-center`}
    >
      <Lightbulb className="w-4 h-4 mr-2" />
      ✨ Contextual Analysis
    </button>
  );

  // Determine the main content based on the responseMode
  let mainContent;

  if (responseMode.includes('Inside')) {
      mainContent = (
        <div className={`p-8 text-center rounded-xl shadow-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white bg-opacity-50 backdrop-blur-md border-gray-200'} flex items-center justify-center flex-grow w-full`}>
          <div className="max-w-md">
            <HardDrive className={`w-8 h-8 mx-auto mb-2 ${accentClass}`} />
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {title}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {isLoggedIn
                  ? 'Private console access enabled. Data streams are secure and internal.'
                  : 'This is the anonymous view of the internal console.'}
            </p>
            {isLoggedIn && analyzeButton}
          </div>
        </div>
      );
  } else {
      // OUTSIDE Mode (Default Chat)
      mainContent = (
        <div className="flex flex-col items-center flex-grow w-full h-full p-4 relative">
          <h1 className={`text-4xl md:text-6xl font-light tracking-tight ${primaryTextClass} text-opacity-80 mb-8 flex-shrink-0`}>
            {title.split('(')[0].trim()}
          </h1>

          {/* This container takes all available height and handles scrolling */}
          <div className="w-full max-w-2xl flex-grow overflow-y-auto space-y-4 p-2">
            {chatHistory.length === 0 && (
                <div className={`p-8 rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[200px] ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}>
                    <p className='mb-2'>Start a conversation or try a command:</p>
                    <p className='text-sm italic'>
                        e.g., Ask about a topic, or use `/plan` or `/agent` to change bot persona.
                    </p>
                    <p className='text-sm italic mt-1'>
                        Use `/local` for client-side processing {isLocalModelReady ? '✅' : '⏳'}.
                    </p>
                    {analyzeButton}
                </div>
            )}
            {chatHistory.slice(-5).map((chat, index) => (
              <div
                key={index}
                // Chat bubbles: soft colors, high radius
                className={`p-3 rounded-2xl max-w-[80%] shadow-sm whitespace-pre-wrap ${
                  chat.role === 'user'
                    ? `${userBubbleBg} ${userBubbleText} ml-auto` // User: Accent color
                    : `${botBubbleBg} ${botBubbleText} mr-auto` // Bot: Light/Dark gray
                }`}
              >
                <p className={`text-xs font-semibold ${chat.role === 'user' ? userBubbleText : botRoleText}`}>
                  {chat.role === 'user' ? 'You' : chat.mode}
                  {chat.sources && chat.sources.length > 0 && <span className='ml-2 text-[10px] opacity-80'> (Grounded)</span>}
                </p>
                <p className="text-sm mt-1">{chat.prompt || chat.response}</p>
                {chat.embedding && Array.isArray(chat.embedding) && (
                   <p className="text-[10px] opacity-70 mt-1">VDB: [{chat.embedding.join(', ').substring(0, 30)}...]</p>
                )}
                {chat.sources && chat.sources.length > 0 && (
                     <div className='mt-2 pt-2 border-t border-current border-opacity-10'>
                         <p className='text-[10px] font-bold'>Sources:</p>
                         {chat.sources.slice(0, 2).map((s, i) => (
                             <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className='text-[10px] underline block hover:opacity-70 truncate'>
                                 {s.title}
                             </a>
                         ))}
                     </div>
                 )}
              </div>
            ))}
          </div>
        </div>
      );
  }

  return (
    // Outer div for MainOutputArea - now just flex-grow
    <div className={`flex-grow flex flex-col items-center justify-center w-full transition-colors duration-500`}>
      {mainContent}
      {/* Public Timeline positioning adjusted to be relative to the main component's flow */}
      {responseMode.includes('Outside') && (
        <div className="absolute top-20 right-4 md:right-8 w-64 hidden lg:block">
          <PublicTimeline chatHistory={chatHistory} theme={theme} />
        </div>
      )}
    </div>
  );
};

const CommandLineInput = ({ prompt, setPrompt, onSubmit, botMode, theme }) => {
  const inputRef = useRef(null);
  const modeIcon = botMode === BOT_NAMES.ASSISTANT ? <Smile size={20} /> : botMode === BOT_NAMES.PLAN ? <Compass size={20} /> : botMode === BOT_NAMES.LOCAL ? <Cpu size={20} /> : <Zap size={20} />;
  const isDark = theme.isDark;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  const cleanPrompt = prompt.startsWith('//') || prompt.startsWith('/') ? prompt.substring(1) : prompt;

  // Input styling adjustment for native look
  const inputBaseStyle = isDark
    ? 'bg-gray-700 rounded-lg text-gray-100 placeholder-gray-400' // Darker, slightly squarer input
    : 'bg-white rounded-full border border-gray-200 text-gray-900 placeholder-gray-500'; // Light, pill-shaped input
  const buttonAccent = theme.accent.replace('text-', 'bg-');

  return (
    // Removed absolute positioning, now uses container padding
    <div className="p-4 md:p-8 flex-shrink-0">
      <div className={`flex items-center px-4 py-2 shadow-lg transition-all duration-300 ${inputBaseStyle} max-w-2xl mx-auto`}>

        <span className={`text-gray-400 mr-2`}>
            {modeIcon}
        </span>

        <input
          ref={inputRef}
          type="text"
          value={cleanPrompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Message or command (e.g., /plan or //login)"
          className={`flex-grow bg-transparent outline-none border-none text-base font-sans`}
          style={{caretColor: theme.accent.replace('text-', '#')}}
        />

        {/* Send Button */}
        <button
          onClick={onSubmit}
          className={`ml-3 p-1.5 rounded-full ${buttonAccent} text-white shadow-md active:opacity-80 transition duration-150 flex-shrink-0`}
          aria-label="Send message"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---

export const App = () => {
  const [environmentData, setEnvironmentData] = useState(null);
  const [appPalette, setAppPalette] = useState(calculatePalette({}));
  const [serverUIConfig, setServerUIConfig] = useState(INITIAL_SERVER_CONFIG);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [botMode, setBotMode] = useState(BOT_NAMES.ASSISTANT);

  // New state: Tracks the desired layout ('Outside' or 'Inside')
  const [currentLayout, setCurrentLayout] = useState(INITIAL_SERVER_CONFIG.layout);
  // responseMode is derived from currentLayout and isLoggedIn in fetchServerUI
  const [responseMode, setResponseMode] = useState(INITIAL_SERVER_CONFIG.layout);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localVDB, setLocalVDB] = useState([]);

  // Local Model State
  const [localPipeline, setLocalPipeline] = useState(null);
  const [isLocalModelLoading, setIsLocalModelLoading] = useState(false);
  const [isLocalModelReady, setIsLocalModelReady] = useState(false);

  // --- INITIALIZATION AND ENVIRONMENT EFFECTS ---

  useEffect(() => {
    const env = detectEnvironment();
    setEnvironmentData(env);
    setAppPalette(calculatePalette(env));

    const initialRecord = localStorage.getItem('sqlite_user_record');
    const storedVDB = localStorage.getItem('local_vdb');
    const isSessionLoggedIn = sessionStorage.getItem('is_logged_in') === 'true';

    if (!initialRecord) {
      storeFirstVisitData(env);
      setIsLoggedIn(true);
    } else {
      const userData = JSON.parse(initialRecord);
      setIsLoggedIn(isSessionLoggedIn);
      if (storedVDB) {
          try {
            setLocalVDB(JSON.parse(storedVDB));
          } catch (e) {
            console.error("Error parsing local VDB:", e);
            setLocalVDB([]);
          }
      }
      console.log('Returning user detected. Data loaded.', userData);
    }

    // Start loading the local model on startup
    const loadPipeline = async () => {
        setIsLocalModelLoading(true);
        const pipeline = await initializeLocalPipeline();
        setLocalPipeline(pipeline);
        setIsLocalModelReady(true);
        setIsLocalModelLoading(false);
    };
    loadPipeline();

  }, []);

  // Effect to fetch UI config whenever environment, login status, or layout changes
  useEffect(() => {
    if (environmentData) {
      const fetchConfig = async () => {
        setIsLoading(true);
        // Pass currentLayout and isLoggedIn to the fetch function
        const config = await fetchServerUI(environmentData, currentLayout, isLoggedIn);
        setServerUIConfig(config);
        setResponseMode(config.layout); // responseMode is now the full string from the server
        localStorage.setItem('server_ui_config', JSON.stringify(config));
        setIsLoading(false);
      };
      fetchConfig();
    }
  }, [environmentData, isLoggedIn, currentLayout]); // Dependency on currentLayout added

  // --- COMMAND AND CHAT LOGIC ---

  const handleToolCommand = (command) => {
    const tool = command.substring(2);
    const toolDef = TOOL_DEFINITIONS['//' + tool] || TOOL_DEFINITIONS['/' + tool];

    if (!toolDef) {
      setChatHistory(prev => [...prev, { role: 'bot', response: `Tool "${tool}" not found.`, mode: 'System', timestamp: Date.now() }]);
      return;
    }

    if (tool === 'login') {
      setShowModal(true);
      return;
    }

    if (toolDef.type === 'redirect' && toolDef.url) {
      setChatHistory(prev => [...prev, {
        role: 'bot',
        response: `[System] Simulating redirect to: ${toolDef.url}`,
        mode: 'System',
        timestamp: Date.now()
      }]);
      return;
    }
  };

  const handleBotCommand = (command) => {
    const subCommand = command.substring(1).toLowerCase();
    let newMode = null;

    if (subCommand === 'assistant') newMode = BOT_NAMES.ASSISTANT;
    else if (subCommand === 'plan') newMode = BOT_NAMES.PLAN;
    else if (subCommand === 'agent') newMode = BOT_NAMES.AGENT;
    else if (subCommand === 'local') {
        if (!isLocalModelReady) {
            setChatHistory(prev => [...prev, { role: 'bot', response: 'Cannot switch. Local model is still loading...', mode: 'System', timestamp: Date.now() }]);
            return;
        }
        newMode = BOT_NAMES.LOCAL;
    }
    else if (subCommand === 'outside') {
        setCurrentLayout('Outside');
        setChatHistory(prev => [...prev, { role: 'bot', response: 'Switched layout to: Outside. Fetching new configuration.', mode: 'System', timestamp: Date.now() }]);
        return;
    }
    else if (subCommand === 'inside') {
        if (!isLoggedIn) {
            setChatHistory(prev => [...prev, { role: 'bot', response: 'Inside mode is restricted. Please use //login first.', mode: 'System', timestamp: Date.now() }]);
            return;
        }
        setCurrentLayout('Inside');
        setChatHistory(prev => [...prev, { role: 'bot', response: 'Switched layout to: Inside. Fetching secure configuration.', mode: 'System', timestamp: Date.now() }]);
        return;
    }
    else if (subCommand === 'logout') {
        sessionStorage.removeItem('is_logged_in');
        setIsLoggedIn(false);
        setCurrentLayout('Outside');
        setChatHistory(prev => [...prev, { role: 'bot', response: 'Logged out. Switching to Outside mode. UI re-fetching.', mode: 'System', timestamp: Date.now() }]);
        return;
    }
    else if (subCommand === 'analyze') {
      handleContextualAnalysis();
      return;
    }

    if (newMode) {
      setBotMode(newMode);
      setChatHistory(prev => [...prev, { role: 'bot', response: `Switched bot mode to: ${newMode}`, mode: 'System', timestamp: Date.now() }]);
    } else {
      setChatHistory(prev => [...prev, { role: 'bot', response: `Unknown bot command: /${subCommand}`, mode: 'System', timestamp: Date.now() }]);
    }
  };

  const handleContextualAnalysis = useCallback(async () => {
    setIsLoading(true);
    setInputPrompt('');

    const conversationContext = chatHistory.slice(-5).map(chat =>
        `${chat.role === 'user' ? 'User' : 'Bot (' + chat.mode + ')'}: ${chat.prompt || chat.response}`
    ).join('\n');

    const analysisPrompt = `Analyze the following conversation history and provide a concise summary, identify the main topic, and suggest a logical next step or action.

Conversation History:
---
${conversationContext}
---
Analysis Request: Summary, Topic, Next Action. Format the output clearly.`;

    const systemPrompt = `You are the Contextual Analysis Engine. Your goal is to process the conversation history and provide structured, insightful feedback.`;

    // 1. Add user message
    setChatHistory(prev => [...prev, {
      role: 'user',
      prompt: '/analyze (Running Contextual Analysis...)',
      mode: 'System',
      userId: 'system',
      timestamp: Date.now(),
      embedding: null,
    }]);

    try {
        const geminiResponse = await callGeminiAPI(analysisPrompt, systemPrompt, false); // No grounding needed for context analysis

        // 2. Add bot response
        setChatHistory(prev => [...prev, {
            role: 'bot',
            response: `✨ **Contextual Analysis Complete**\n\n${geminiResponse.text}`,
            mode: 'Gemini Analysis',
            timestamp: Date.now(),
            embedding: null,
        }]);
    } catch (error) {
        setChatHistory(prev => [...prev, { role: 'bot', response: 'Error during analysis process.', mode: 'System', timestamp: Date.now() }]);
        console.error('Analysis LLM Error:', error);
    } finally {
        setIsLoading(false);
    }

  }, [chatHistory]);


  const handleChat = useCallback(async () => {
    if (!inputPrompt.trim() || isLoading) return;

    const currentPrompt = inputPrompt.trim();
    setInputPrompt('');
    setIsLoading(true);

    const isOnline = navigator.onLine;
    const userId = localStorage.getItem('sqlite_user_record') ? JSON.parse(localStorage.getItem('sqlite_user_record')).sessionId : 'anonymous';

    // 1. Add user message
    setChatHistory(prev => [...prev, {
      role: 'user',
      prompt: currentPrompt,
      mode: botMode,
      userId: userId,
      timestamp: Date.now(),
      embedding: null,
    }]);

    try {
      let result;
      if (botMode === BOT_NAMES.LOCAL) {
          // 2. Local Model Inference (Simulated transformers.js)
          result = await processLLMInteraction(currentPrompt, botMode, isOnline, localVDB);
      } else {
          // 2. Remote/Server Model Inference (Real Gemini API)
          result = await processLLMInteraction(currentPrompt, botMode, isOnline, localVDB);
      }

      const { text, newVDBEntry, sources } = result;

      if (newVDBEntry) {
        setLocalVDB(prev => {
            const newVDB = [...prev, newVDBEntry];
            localStorage.setItem('local_vdb', JSON.stringify(newVDB));
            return newVDB;
        });
      }

      // 3. Add bot response
      setChatHistory(prev => [...prev, {
        role: 'bot',
        response: text,
        mode: botMode,
        timestamp: Date.now(),
        embedding: newVDBEntry ? newVDBEntry.embedding : null,
        sources: sources || [],
      }]);

    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'bot', response: 'Error during conversation process.', mode: 'System', timestamp: Date.now() }]);
      console.error('LLM Simulation Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [inputPrompt, botMode, isLoading, localVDB]);

  const handleSubmit = () => {
    const trimmedPrompt = inputPrompt.trim();

    if (trimmedPrompt.startsWith('//')) {
      handleToolCommand(trimmedPrompt);
    } else if (trimmedPrompt.startsWith('/')) {
      handleBotCommand(trimmedPrompt);
    } else {
      handleChat();
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('is_logged_in', 'true');
    setShowModal(false);
    // UI fetch will be triggered by isLoggedIn change
    setChatHistory(prev => [...prev, { role: 'bot', response: 'Login successful! Adaptive UI re-fetching for secure access.', mode: 'System', timestamp: Date.now() }]);
  };

  // Combined theme from palette and server config
  const finalTheme = {
    ...appPalette,
    ...serverUIConfig.theme,
  };

  const bgClass = finalTheme.primaryBg;
  const isDark = finalTheme.isDark;

  // --- RENDERING ---
  if (!environmentData || isLoading && inputPrompt === '') {
    const spinnerColor = isDark ? 'text-white' : 'text-gray-500';
    const textColor = isDark ? 'text-white' : 'text-gray-700';
    return (
        <div className={`flex items-center justify-center h-screen ${bgClass}`}>
          <div className="text-center">
            <svg className={`animate-spin h-8 w-8 ${spinnerColor} mx-auto`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className={`mt-4 ${textColor}`}>Detecting environment and fetching adaptive UI...</p>
          </div>
        </div>
    );
  }

  // Header styling for native look
  const headerBaseStyle = isDark
    ? `${finalTheme.primaryBg} shadow-xl border-b border-gray-700` // Solid dark header
    : 'backdrop-blur-md bg-white bg-opacity-80 border-b border-gray-200 shadow-sm'; // Blurred light header (iOS style)
  const headerTextColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const headerAccentText = finalTheme.accent;

  const getLocalModelStatus = () => {
    if (isLocalModelLoading) return { text: 'Loading', color: 'text-yellow-500' };
    if (isLocalModelReady) return { text: 'Ready (Local Mode: /local)', color: 'text-green-500' };
    return { text: 'Disabled', color: 'text-red-500' };
  };

  const modelStatus = getLocalModelStatus();

  return (
    // Updated to h-screen and flex-col for full height responsiveness
    <div className={`flex flex-col h-screen ${bgClass} font-sans transition-colors duration-1000 overflow-hidden`}>
      <header className={`sticky top-0 z-10 p-4 ${headerBaseStyle} flex-shrink-0`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
            <button className={`text-sm font-medium ${headerAccentText} hover:opacity-70 transition`}>
                <ChevronRight className='inline w-4 h-4 transform rotate-180 mr-1' />
                Back
            </button>
          <h1 className={`text-lg font-semibold ${headerTextColor}`}>
            {serverUIConfig.title}
          </h1>
          <div className="flex space-x-4 items-center">

            {/* Local Model Status Indicator */}
            <div className={`text-xs flex items-center hidden md:flex ${modelStatus.color}`}>
                <HardDrive className={`w-3 h-3 mr-1 ${modelStatus.color}`} />
                {modelStatus.text}
            </div>

            <span className={`text-gray-500 hidden sm:inline text-sm`}>{environmentData.os} / {environmentData.deviceType}</span>
            <span className={`text-gray-700`}>
                {isLoggedIn ? <User className="inline w-4 h-4 text-green-500" /> : <LogIn className="inline w-4 h-4 text-red-500" />}
            </span>
            <button
                className={`p-1 rounded-lg ${finalTheme.accent.replace('text-', 'bg-')} bg-opacity-10 ${finalTheme.accent} hover:bg-opacity-20 active:bg-opacity-30 transition`}
                onClick={() => {
                    const nextLayout = currentLayout === 'Outside' ? 'Inside' : 'Outside';
                    if (nextLayout === 'Inside' && !isLoggedIn) {
                        setChatHistory(prev => [...prev, { role: 'bot', response: 'Inside mode is restricted. Please use //login first.', mode: 'System', timestamp: Date.now() }]);
                        return;
                    }
                    setCurrentLayout(nextLayout);
                    setChatHistory(prev => [...prev, { role: 'bot', response: `Switched layout via button to: ${nextLayout}. UI re-fetching.`, mode: 'System', timestamp: Date.now() }]);
                }}
                title="Toggle Mode"
            >
                {currentLayout === 'Outside' ? <HardDrive size={20} /> : <Globe size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content area takes up all remaining height */}
      <MainOutputArea
        title={serverUIConfig.title}
        chatHistory={chatHistory}
        responseMode={responseMode}
        theme={finalTheme}
        isLoggedIn={isLoggedIn}
        isLocalModelReady={isLocalModelReady}
        setInputPrompt={setInputPrompt}
      />

      {/* Input area is now part of the flex column layout */}
      <CommandLineInput
        prompt={inputPrompt}
        setPrompt={setInputPrompt}
        onSubmit={handleSubmit}
        botMode={botMode}
        theme={finalTheme}
      />

      {showModal && (
        <LoginModal
          onClose={() => setShowModal(false)}
          onSuccess={handleLoginSuccess}
          theme={finalTheme}
        />
      )}
      {/* Loading overlay for chat/commands */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-40">
           <div className={`flex items-center p-4 rounded-xl shadow-2xl ${isDark ? 'bg-gray-700' : 'bg-white bg-opacity-90 backdrop-blur-md'}`}>
                <svg className={`animate-spin h-6 w-6 ${isDark ? 'text-white' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className={`ml-3 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    {botMode === BOT_NAMES.LOCAL ? 'Running Local Inference...' : 'Calling Gemini API...'}
                </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
