/* =====================================================================
   CALAMITY: the file you edit.
   Links, the "What we make" cards (with their videos) and the FAQs all live here.
   You never need to touch index.html or app.js for normal changes.
   ===================================================================== */
window.SITE = {
    /* ---------- LINKS ----------
       Replace these with your real booking links. */
    links: {
        booking: "https://example.com/book", // "Book a discovery call" box
        creative: "https://example.com/creative-director", // "Looking for a creative director?" box
        cta: "https://example.com/book", // the floating "Book a content day now" button
    },

    /* ---------- WHAT WE MAKE ----------
       One block per card. To add a card, copy a block. To remove one, delete its block.
       Cards appear in this order, top to bottom.

       VIDEOS: these are filled in automatically from media.js, which the build-media.ps1
       script makes from your video folders (the "media" line on each card is what links them).
       One video = no swiping, 2 or more = swipe sideways.

       You can also add videos by hand for a card instead, like this:
           videos: [
               { video: "assets/videos/green-screens-1.mp4", poster: "assets/posters/green-screens-1.jpg" },
               { video: "assets/videos/green-screens-2.mp4", poster: "assets/posters/green-screens-2.jpg" },
           ],
    */
    cards: [
        {
            title: "GREEN SCREENS",
            media: "green-screens",
            color: "#6b5b23",
            description: "Presenter-led commentary, reaction and storytelling using visual context.",
            videos: [],
        },
        {
            title: "FACELESS",
            media: "faceless",
            color: "#0e4b4a",
            description: "Voiceover, footage, graphics, text and product-led content without an on-camera personality.",
            videos: [],
        },
        {
            title: "VOX POPS",
            media: "vox-pops",
            color: "#6a1c3c",
            description: "Street interviews, questions, reactions and real-world conversations.",
            videos: [],
        },
        {
            title: "PODCASTS",
            media: "podcasts",
            color: "#c8872a",
            description: "Long-form conversations captured and produced for social platforms.",
            videos: [],
        },
        {
            title: "TALKING HEAD",
            media: "talking-head",
            color: "#6b5b23",
            description: "Direct-to-camera opinion, expertise, storytelling and personality-led content.",
            videos: [],
        },
        {
            title: "TRENDS",
            media: "trends",
            color: "#0e4b4a",
            description: "Platform-native and culturally relevant social formats executed for your brand.",
            videos: [],
        },
        {
            title: "SKITS",
            media: "skits",
            color: "#6a1c3c",
            description: "Scripted entertainment, scenarios, characters and comedy.",
            videos: [],
        },
        {
            title: "INSTRUCTIONAL",
            media: "instructional",
            color: "#c8872a",
            description: "Cooking, tutorials, demonstrations, processes, product use and how-to content.",
            videos: [],
        },
        {
            title: "SPORTS",
            media: "sports",
            color: "#6b5b23",
            description: "Social-first storytelling that brings fans closer to the game, the players and everything in between.",
            videos: [],
        },
        {
            title: "RANDOM BUT IT WORKS",
            media: "random-but-it-works",
            color: "#0e4b4a",
            description: "Imaginative concepts, experimental visuals and unconventional storytelling that push the boundaries of social content.",
            videos: [],
        },
    ],

    /* ---------- FAQS ----------
       Edit the questions and answers here. Add or remove blocks as you like. */
    faqs: [
        {
            q: "What do we film?",
            a: "Whatever makes sense for your business. Green screens, talking heads, vox pops, faceless content, trends, skits, instructional, vlogs and more. We’ll help build the right mix for your Content Day.",
        },
        {
            q: "Do I need to know what I want to make?",
            a: "No. If you have ideas, bring them. If you don’t, we’ll help shape the day around your business, audience and what you want to achieve.",
        },
        {
            q: "Do you write the scripts?",
            a: "We can. Scripting, planning, shot lists and production prep can all be handled by Calamity as part of pre-production.",
        },
        {
            q: "What do I need to bring?",
            a: "Mostly, yourself. Once we know what we’re making, we’ll tell you exactly what we need from you before the shoot — products, wardrobe, props, people or anything else specific to the content.",
        },
        {
            q: "Where do we shoot?",
            a: "We can shoot at your business, on location or in a studio depending on what we’re making. If a specific location or studio is required, we’ll organise it with you.",
        },
        {
            q: "What’s included in a content day?",
            a: "Your Calamity production team, the shoot itself and the production required to capture your content. Pre-production and post-production are scoped around what your particular Content Day requires.",
        },
        {
            q: "How much content will I get?",
            a: "It depends on what we’re making. Ten simple talking-head pieces are very different to ten skits or highly produced videos. We scope the expected output with you before the day so everyone knows what we’re making.",
        },
        {
            q: "How long until I get my content?",
            a: "Your delivery timeline is confirmed before production based on the volume and complexity of the content being made.",
        },
        {
            q: "Can you just edit content we’ve already filmed?",
            a: "No. Our post-production is built around content produced by Calamity. We don’t offer editing-only services for externally.",
        },
    ],
};
