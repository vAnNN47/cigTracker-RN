/**
 * Lightweight localization — ported from lib/l10n/strings.dart.
 * makeStrings(he) returns the active string table; useStrings() (separate hook)
 * resolves `he` from the device/locale. RTL handling comes in Step 7.
 */
export function makeStrings(he: boolean) {
  return {
    he,
    localeCode: he ? "he" : "en",

    // Nav
    today: he ? "היום" : "Today",
    calendar: he ? "יומן" : "Calendar",
    progress: he ? "התקדמות" : "Progress",
    settings: he ? "הגדרות" : "Settings",

    // Home
    ofToday: (limit: number) => (he ? `מתוך ${limit} היום` : `of ${limit} today`),
    leftInBudget: (n: number) => (he ? `נשארו ${n} במכסה` : `${n} left in budget`),
    overLimit: (n: number) => (he ? `${n} מעל המכסה` : `${n} over your limit`),
    loggedCount: he ? "נרשמו" : "logged",
    nothingToday: he ? "עדיין לא נרשם כלום היום." : "Nothing logged yet today.",
    addCigarette: he ? "הוסף סיגריה" : "Add cigarette",
    addPurchase: he ? "הוסף קנייה" : "Add purchase",

    // Home — redesigned Today screen
    appTitle: he ? "מעקב סיגריות" : "Cig Tracker",
    todaysAllowance: he ? "המכסה היומית" : "Today's Allowance",
    leftLabel: he ? "נותרו" : "Left",
    usedToday: (used: number, limit: number) =>
      he ? `${used} / ${limit} סיגריות היום` : `${used} / ${limit} cigarettes used today`,
    spentToday: he ? "הוצאה היום" : "Spent Today",
    savedShort: he ? "נחסך" : "Saved",
    dayStreak: he ? "רצף ימים" : "Day Streak",
    avgDaily: he ? "ממוצע יומי" : "Avg Daily",
    todaysLog: he ? "יומן היום" : "Today's Log",
    recentlySmoked: he ? "נעשנו לאחרונה" : "Recently smoked",
    viewAll: he ? "הצג הכול" : "View All",
    recentPurchase: he ? "קנייה אחרונה" : "Recent Purchase",
    viewHistory: he ? "הצג היסטוריה" : "View History",
    noPurchasesYet: he ? "עדיין אין קניות." : "No purchases yet.",
    cigNumber: (n: number) => (he ? `סיגריה מס' ${n}` : `Cigarette #${n}`),
    insightFewer: (n: number) =>
      he
        ? `אתה מעשן ${n} פחות מהממוצע השבועי שלך. כל הכבוד!`
        : `You're smoking ${n} fewer than your 7-day average. Keep it up!`,
    insightMore: (n: number) =>
      he
        ? `אתה מעשן ${n} יותר מהממוצע השבועי שלך.`
        : `You're smoking ${n} more than your 7-day average.`,
    insightSame: he ? "אתה בדיוק על הממוצע השבועי שלך." : "You're right on your 7-day average.",

    // Diary / History browser
    diaryTab: he ? "יומן" : "Diary",
    cigarettesSection: he ? "סיגריות" : "Cigarettes",
    spentLabel: he ? "הוצאה" : "Spent",
    loggedN: (n: number) => (he ? `נרשמו ${n}` : `Logged ${n}`),
    logCigarette: he ? "רשום סיגריה" : "Log Cigarette",
    timeLabel: he ? "שעה" : "Time",
    comingSoon: he ? "בקרוב…" : "Coming soon…",

    // Add / edit sheet
    logACigarette: he ? "רישום סיגריה" : "Log a cigarette",
    loggedNow: he ? "נרשם עכשיו, על היום." : "Logged now, on today.",
    commentHint: he ? "הערה קצרה (לא חובה)" : "Quick comment (optional)",
    diary: he ? "יומן" : "Diary",
    diaryHint: he
      ? "איך אתה מרגיש עכשיו? (ננעל מחר)"
      : "How do you feel right now? (locks tomorrow)",
    add: he ? "הוסף" : "Add",
    couldNotSave: he ? "השמירה נכשלה" : "Couldn't save",
    save: he ? "שמור" : "Save",
    cancel: he ? "ביטול" : "Cancel",
    delete: he ? "מחק" : "Delete",
    editEntry: he ? "עריכת רישום" : "Edit entry",
    comment: he ? "הערה" : "Comment",
    diaryTodayOnly: he ? "יומן (היום בלבד)" : "Diary (today only)",
    whyLockTitle: he ? "למה אי אפשר לערוך ימים שעברו?" : "Why can't I edit past days?",
    whyLockBody: he
      ? "היומן מתעד איך הרגשת באותו רגע. ברגע שהיום עובר, ההרגשה מתעמעמת והזיכרון משכתב אותה — לכן הרשומות ננעלות בסוף היום כדי לשמור עליהן כנות. אפשר לכתוב ולערוך רק את רשומות היום."
      : "Your diary captures how you felt in the moment. Once a day passes, that feeling fades and memory reshapes it — so entries lock at the end of the day to keep them honest. You can only write or edit today's entries.",
    gotIt: he ? "הבנתי" : "Got it",

    // Calendar
    pastLocked: he
      ? "יום שעבר — היומן נעול. צפייה בלבד."
      : "Past day — diary is locked. View only.",
    noLogsThisDay: he ? "לא נרשמו סיגריות ביום זה." : "No cigarettes logged this day.",
    purchases: he ? "קניות" : "Purchases",
    noPurchasesThisDay: he ? "לא נרשמו קניות ביום זה." : "No purchases this day.",

    // Stats
    avgPerDay: he ? "ממוצע ליום" : "Avg / day",
    onTargetDays: he ? "ימים ביעד" : "On-target days",
    saved: he ? "נחסך" : "Saved",
    cigsVsLimit: he ? "סיגריות מול המכסה" : "Cigarettes vs limit",
    smoked: he ? "עושן" : "Smoked",
    limitLabel: he ? "מכסה" : "Limit",
    over: he ? "מעל" : "Over",
    moneySaved: he ? "כסף שנחסך" : "Money saved",
    baselineNote: (n: number) => (he ? `ביחס לבסיס של ${n} ביום.` : `Versus your baseline of ${n}/day.`),
    noData: he ? "אין נתונים עדיין" : "No data yet",
    spentSummary: (cur: string, spent: string, cigs: number) =>
      he
        ? `הוצאת ${cur}${spent} על ${cigs} סיגריות שנקנו`
        : `Spent ${cur}${spent} on ${cigs} cigarettes bought`,

    // Settings
    language: he ? "שפה" : "Language",
    device: he ? "מכשיר" : "Device",
    english: "English",
    hebrew: "עברית",
    dailyGoal: he ? "יעד יומי" : "Daily goal",
    maxPerDay: he ? "מקסימום סיגריות ליום" : "Max cigarettes per day",
    appliesFromToday: he
      ? "חל מהיום. ימים שעברו שומרים על המכסה הישנה."
      : "Applies from today. Past days keep their old limit.",
    baseline: he ? "בסיס (לפני ההפחתה)" : "Baseline (before quitting)",
    baselineHelper: he ? "משמש לחישוב הכסף שנחסך." : "Used to calculate money saved.",
    dayStart: he ? "היום מתחיל בשעה" : "Day starts at",
    dayStartHelper: he
      ? "עישון לפני שעה זו נספר ליום הקודם (לינשופי לילה)."
      : "Smoking before this hour counts to the previous day (for night owls).",
    pricing: he ? "תמחור" : "Pricing",
    pricePerPack: (cur: string) => (he ? `מחיר לחפיסה (${cur})` : `Price per pack (${cur})`),
    currency: he ? "מטבע" : "Currency",
    demoNote: he
      ? "נתוני הדגמה נשמרים בזיכרון ומתאפסים בהפעלה מחדש. חבר את Supabase כדי לשמור ולסנכרן בין מכשירים."
      : "Demo data lives in memory and resets on restart. Connect Supabase to persist and sync across devices.",
    signOut: he ? "התנתק" : "Sign out",
    signOutTitle: he ? "להתנתק?" : "Sign out?",
    signOutBody: he ? "תצטרך להתחבר שוב כדי לראות את הנתונים שלך." : "You'll need to sign in again to see your data.",
    pack: he ? "חפיסה" : "Pack",
    carton: he ? "קרטון" : "Carton",
    quantity: he ? "כמות" : "Quantity",
    totalPrice: he ? "מחיר כולל" : "Total price",

    // Login
    appName: he ? "מעקב סיגריות" : "Cigarette Tracker",
    loginTagline: he
      ? "עקוב אחר העישון שלך והפחת אותו בהדרגה."
      : "Track your smoking and bring it down, gradually.",
    continueWithGoogle: he ? "המשך עם Google" : "Continue with Google",
    signingIn: he ? "מתחבר…" : "Signing in…",

    // Logged toast
    loggedToast: he ? "נרשם ✓" : "Logged ✓",
    savedToast: he ? "נשמר ✓" : "Saved ✓",
    undo: he ? "בטל" : "Undo",
    cigsInThis: (n: number) => (he ? `${n} סיגריות` : `${n} cigarettes`),

    // Onboarding
    welcomeTitle: he ? "ברוך הבא" : "Welcome",
    onboardingIntro: he
      ? "בוא נכייל את המעקב. אפשר לשנות הכול אחר כך בהגדרות."
      : "Let's set up your tracking. You can change all of this later in Settings.",
    onboardBaselineQ: he
      ? "כמה סיגריות ביום אתה מעשן כיום?"
      : "How many cigarettes a day do you smoke now?",
    onboardTargetQ: he ? "לאיזה יעד יומי תרצה לכוון?" : "What daily limit do you want to aim for?",
    startTracking: he ? "בוא נתחיל" : "Get started",

    // Time-of-day insight
    whenYouSmoke: he ? "מתי אתה מעשן" : "When you smoke",
    peakAround: (time: string) => (he ? `הכי הרבה בסביבות ${time}` : `Most around ${time}`),
    notEnoughData: he ? "אין מספיק נתונים עדיין" : "Not enough data yet",

    // Week comparison
    weekVsWeek: he ? "השבוע מול שבוע שעבר" : "This week vs last week",
    thisWeek: he ? "השבוע" : "This week",
    lastWeek: he ? "שבוע שעבר" : "Last week",
    fewerThanLast: (n: number) => (he ? `${n} פחות משבוע שעבר` : `${n} fewer than last week`),
    moreThanLast: (n: number) => (he ? `${n} יותר משבוע שעבר` : `${n} more than last week`),
    sameAsLast: he ? "כמו שבוע שעבר" : "Same as last week",
  };
}

export type Strings = ReturnType<typeof makeStrings>;
