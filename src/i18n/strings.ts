/**
 * Lightweight localization. makeStrings(he) returns the active string table;
 * useStrings() (separate hook) resolves `he` from the device/locale.
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

    // Accessibility — screen-reader labels for icon-only controls
    a11yBack: he ? "חזרה" : "Back",
    a11yOpenMenu: he ? "פתח תפריט" : "Open menu",
    a11yOpenAccount: he ? "פתח חשבון" : "Open account",
    a11yPrevMonth: he ? "החודש הקודם" : "Previous month",
    a11yNextMonth: he ? "החודש הבא" : "Next month",
    a11yDecrease: (label: string) => (he ? `הפחתת ${label}` : `Decrease ${label}`),
    a11yIncrease: (label: string) => (he ? `הגדלת ${label}` : `Increase ${label}`),
    a11yDayCell: (date: number, count: number, status: "none" | "under" | "over") =>
      he
        ? status === "none"
          ? `${date} בחודש, אין רישומים`
          : `${date} בחודש, ${count} סיגריות, ${status === "over" ? "מעל המכסה" : "בתוך המכסה"}`
        : status === "none"
          ? `Day ${date}, no entries`
          : `Day ${date}, ${count} cigarettes, ${status === "over" ? "over limit" : "within limit"}`,

    // Home
    ofToday: (limit: number) => (he ? `מתוך ${limit} היום` : `of ${limit} today`),
    leftInBudget: (n: number) => (he ? `נשארו ${n} במכסה` : `${n} left in budget`),
    overLimit: (n: number) => (he ? `${n} מעל המכסה` : `${n} over your limit`),
    loggedCount: he ? "נרשמו" : "logged",
    nothingToday: he ? "עדיין לא נרשם כלום היום." : "Nothing logged yet today.",
    addCigarette: he ? "הוסף סיגריה" : "Add cigarette",
    addPurchase: he ? "הוסף קנייה" : "Add purchase",

    // Home — redesigned Today screen (haze)
    todaySub: he ? "לאט ובטוח, יום אחד בכל פעם" : "Easy does it today",
    statusUnderLine: he ? "אתה בקצב טוב" : "You're pacing well",
    statusAtLine: he ? "הגעת בדיוק למכסה" : "Right at your limit",
    statusOverLine: he ? "מעל המכסה היום" : "Over for today",
    subUnder: he ? "המשך כך — יום אחד בכל פעם." : "Keep going — one at a time.",
    subAt: he ? "אתה בדיוק על היעד." : "You're right on target.",
    subOver: he ? "בלי לשפוט. מחר התחלה חדשה." : "No judgment — tomorrow's fresh.",
    recent: he ? "לאחרונה" : "Recent",
    logOne: he ? "רשום אחת" : "Log one",
    buy: he ? "קנייה" : "Buy",
    ofN: (n: number) => (he ? `מתוך ${n}` : `of ${n}`),
    thisMonth: he ? "החודש" : "this month",

    appTitle: he ? "מעקב סיגריות" : "Cig Tracker",
    // Community tab
    communityIntro: he ? "אתם לא לבד במסע הזה." : "You're not alone in this.",
    communityShareTitle: he ? "שתפו את ההתקדמות שלכם" : "Share your progress",
    communityShareSub: he ? "ספרו לקהילה איך הולך לכם היום." : "Tell the community how today is going.",
    communityShareBtn: he ? "כתיבת פוסט" : "Write a post",
    communityTopics: he ? "נושאים" : "Topics",
    communityFeed: he ? "פיד הקהילה" : "Community feed",
    topicMilestones: he ? "אבני דרך" : "Milestones",
    topicCravings: he ? "התמודדות עם דחף" : "Cravings",
    topicSavings: he ? "חיסכון" : "Savings",
    topicSupport: he ? "תמיכה" : "Support",
    likesN: (n: number) => (he ? `${n} לייקים` : `${n} likes`),
    repliesN: (n: number) => (he ? `${n} תגובות` : `${n} replies`),
    communityPosts: he
      ? [
          { name: "מאיה", time: "לפני שעתיים", text: "שבוע שלם מתחת למכסה! החשק עדיין מגיע אבל אני נושמת ועובר.", likes: 42, replies: 8 },
          { name: "דני", time: "לפני 5 שעות", text: "חסכתי 320 ₪ החודש. במקום זה קניתי נעלי ריצה 🏃", likes: 67, replies: 15 },
          { name: "נועה", time: "אתמול", text: "הטיפ שעזר לי הכי הרבה: לשתות מים בכל פעם שמתחשק. מה עובד לכם?", likes: 31, replies: 23 },
          { name: "אלכס", time: "לפני יומיים", text: "יום 30 בלי לעבור את המכסה. הריאות מודות לי 💚", likes: 88, replies: 12 },
        ]
      : [
          { name: "Maya", time: "2h ago", text: "A full week under my limit! The cravings still come but I breathe and they pass.", likes: 42, replies: 8 },
          { name: "Danny", time: "5h ago", text: "Saved $90 this month. Bought running shoes instead 🏃", likes: 67, replies: 15 },
          { name: "Noa", time: "yesterday", text: "The tip that helped me most: drink water whenever a craving hits. What works for you?", likes: 31, replies: 23 },
          { name: "Alex", time: "2 days ago", text: "Day 30 without going over my limit. My lungs are thanking me 💚", likes: 88, replies: 12 },
        ],
    // Drawers
    menu: he ? "תפריט" : "Menu",
    community: he ? "קהילה" : "Community",
    signedIn: he ? "מחובר" : "Signed in",
    notSignedIn: he ? "לא מחובר" : "Not signed in",
    guest: he ? "אורח" : "Guest",
    notifications: he ? "התראות" : "Notifications",
    statusOn: he ? "פעיל" : "Enabled",
    statusOff: he ? "כבוי" : "Disabled",
    about: he ? "אודות" : "About",
    version: he ? "גרסה" : "Version",
    faq: he ? "שאלות נפוצות" : "FAQ",
    shareApp: he ? "שתף את האפליקציה" : "Share this app",
    feedback: he ? "משוב" : "Feedback",
    sendFeedback: he ? "שלח לנו משוב" : "Send us feedback",
    rateApp: he ? "דרג את האפליקציה" : "Rate this app",
    troubleshooting: he ? "פתרון בעיות" : "Troubleshooting",
    privacy: he ? "פרטיות" : "Privacy",
    privacySettings: he ? "הגדרות פרטיות" : "Privacy settings",
    privacyPolicy: he ? "מדיניות פרטיות" : "Privacy policy",
    termsOfService: he ? "תנאי שימוש" : "Terms of service",
    shareMessage: he
      ? "אני מפחית עישון עם Cig Tracker 🚭"
      : "I'm cutting down on smoking with Cig Tracker 🚭",
    // v2 light Today
    reduceTitle: he ? "הפחתת סיגריות" : "Reduce cigarettes",
    todayImpact: he ? "ההשפעה של היום" : "Today's impact",
    keepMomentum: he ? "שמור על המומנטום שלך." : "Keep your momentum.",
    smokedTodayShort: he ? "עושנו היום" : "Smoked today",
    leftTodayN: (n: number) => (he ? `${n} נותרו להיום` : `${n} left today`),
    remainingTodayShort: he ? "נותרו היום" : "Remaining today",
    smokedTodayN: (n: number) => (he ? `${n} עושנו היום` : `${n} smoked today`),
    tapToLog: he ? "הקש על העיגול לרישום" : "Tap the circle to log",
    countDown: he ? "ספירה לאחור" : "Count down",
    countDownHint: he ? "התחל מהמכסה וספור כלפי מטה" : "Start at your limit and count down",
    streakDaysN: (n: number) => (he ? `רצף: ${n} ימים` : `Streak: ${n} days`),
    weeklySavings: he ? "חיסכון שבועי" : "Weekly savings",
    logPurchaseBtn: he ? "תיעוד רכישה" : "Log purchase",
    purchaseHistoryBtn: he ? "היסטוריית רכישות" : "Purchase history",
    recentLogTitle: he ? "יומן אחרון" : "Recent log",
    gainingMomentum: he ? "צוברים תאוצה" : "Gaining momentum",
    quotes: he
      ? [
          "כל סיגריה שלא עישנת היא ניצחון.",
          "התקדמות, לא שלמות.",
          "אתה חזק יותר מהדחף.",
          "יום אחד בכל פעם.",
          "הגוף שלך מודה לך כבר עכשיו.",
        ]
      : [
          "Every cigarette you skip is a win.",
          "Progress, not perfection.",
          "You're stronger than the urge.",
          "One day at a time.",
          "Your body is already thanking you.",
        ],
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

    // Log-a-cigarette sheet — location + feeling
    whereWereYou: he ? "איפה היית?" : "Where were you?",
    tagHome: he ? "בית" : "Home",
    tagWork: he ? "עבודה" : "Work",
    tagCar: he ? "רכב" : "Car",
    tagSocial: he ? "חברתי" : "Social",
    howDidItFeel: he ? "איך זה הרגיש באותו רגע?" : "How did it feel in that moment?",
    feelStressed: he ? "לחוץ" : "Stressed",
    feelBored: he ? "משועמם" : "Bored",
    feelCraving: he ? "חשק" : "Craving",
    feelSocial: he ? "חברתי" : "Social",
    feelAfterMeal: he ? "אחרי אוכל" : "After meal",
    feelHabit: he ? "הרגל" : "Habit",
    feelingHint: he ? "לחוץ, משועמם, הרגע קמתי…" : "stressed, bored, just woke up…",
    giveMoreInfo: he ? "עוד פרטים" : "Give more info",
    whenQ: he ? "מתי?" : "When?",
    anythingElse: he ? "עוד משהו על הסיגריה הזו?" : "Anything else about this one?",
    addToToday: he ? "הוסף להיום" : "Add to today",
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
    readAll: he ? "קרא הכל" : "Read all",
    showLess: he ? "הצג פחות" : "Show less",
    copyText: he ? "העתק טקסט" : "Copy text",

    // Calendar
    pastLocked: he
      ? "יום שעבר — היומן נעול. צפייה בלבד."
      : "Past day — diary is locked. View only.",
    noLogsThisDay: he ? "לא נרשמו סיגריות ביום זה." : "No cigarettes logged this day.",
    purchases: he ? "קניות" : "Purchases",
    noPurchasesThisDay: he ? "לא נרשמו קניות ביום זה." : "No purchases this day.",
    daysUnder: he ? "ימים מתחת" : "Days under",
    daysOver: he ? "ימים מעל" : "Days over",
    monthTotal: he ? "סה״כ החודש" : "Month total",

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
    appearance: he ? "מראה" : "Appearance",
    theme: he ? "ערכת נושא" : "Theme",
    themeDevice: he ? "מכשיר" : "Device",
    themeLight: he ? "בהיר" : "Light",
    themeDark: he ? "כהה" : "Dark",
    english: "English",
    hebrew: "עברית",
    russian: "Русский",
    arabic: "العربية",
    spanish: "Español",
    reductionPlan: he ? "תוכנית הפחתה" : "Reduction plan",
    oldHabit: he ? "הרגל ישן" : "Old habit",
    todaysLimitShort: he ? "מכסה היום" : "Today's limit",
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
    editPurchase: he ? "עריכת קנייה" : "Edit purchase",
    deletePurchaseTitle: he ? "למחוק את הקנייה?" : "Delete purchase?",
    deletePurchaseBody: he ? "לא ניתן לבטל פעולה זו." : "This can't be undone.",
    purchaseDeletedToast: he ? "הקנייה נמחקה" : "Purchase deleted",
    copiedToast: he ? "הועתק ללוח" : "Copied to clipboard",

    // Login
    appName: he ? "מעקב סיגריות" : "Cigarette Tracker",
    loginTagline: he
      ? "עקוב אחר העישון שלך והפחת אותו בהדרגה."
      : "Track your smoking and bring it down, gradually.",
    continueWithGoogle: he ? "המשך עם Google" : "Continue with Google",
    signingIn: he ? "מתחבר…" : "Signing in…",
    agreePrefix: he ? "בהרשמה אתה מסכים ל" : "By signing up you agree to our",
    agreeAnd: he ? "ול" : "and",
    chooseLanguage: he ? "בחר שפה" : "Choose language",
    close: he ? "סגור" : "Close",

    // Welcome / choose data mode
    welcomeHeadline: he ? "ברוך הבא למעקב סיגריות" : "Welcome to Cig Tracker",
    welcomeBlurb: he
      ? "עקוב אחר העישון שלך, ראה כמה חסכת, והפחת בהדרגה."
      : "Track your smoking, see what you save, and cut down gradually.",
    continueLocally: he ? "המשך ללא חשבון" : "Continue without an account",
    orDivider: he ? "או" : "or",
    localModeNote: he
      ? "הנתונים יישמרו במכשיר זה בלבד. אפשר להתחבר לחשבון מאוחר יותר."
      : "Your data stays on this device. You can sign in to an account later.",
    cloudModeNote: he
      ? "ההתחברות שומרת ומסנכרנת את הנתונים בין מכשירים."
      : "Signing in saves and syncs your data across devices.",

    // Settings — account / data mode
    account: he ? "חשבון" : "Account",
    localDataNote: he ? "הנתונים נשמרים במכשיר זה." : "Your data is saved on this device.",
    signInToAccount: he ? "התחבר לחשבון" : "Sign in to an account",

    // Purchase history
    purchaseHistory: he ? "היסטוריית קניות" : "Purchase history",
    totalSpentLabel: he ? "סך הכל הוצאה" : "Total spent",

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
