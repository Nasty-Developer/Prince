const illustrativeDogPhotos = {
  outdoors:
    "https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=1200&q=78",
  resting:
    "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=1200&q=78",
} as const;

export type RelatedLink = {
  label: string;
  href: string;
};

export type IllustrativeStory = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  imageUrl: string;
  illustrative: true;
  createdAt?: string | null;
  relatedLinks: RelatedLink[];
};

export const illustrativeStories: IllustrativeStory[] = [
  {
    id: "illustrative-a-clear-sighting",
    slug: "a-clear-sighting",
    title: "A clear sighting gives care a place to start",
    excerpt:
      "An educational scenario about noticing a dog, keeping a safe distance, and sharing useful details.",
    body: `Illustrative community-care scenario — this is not a report of a real rescue or an individual. Imagine noticing a dog who is limping near a busy road. The first helpful step is not to rush toward the dog. From a safe place, note the nearest landmark, the time, and what you can see without guessing about the cause.\n\nA clear report helps a qualified local responder decide what to do next. If the dog is in immediate danger, contact an appropriate local animal-care service or veterinarian. Avoid blocking traffic, chasing the dog, or attempting treatment yourself.`,
    imageUrl: illustrativeDogPhotos.outdoors,
    illustrative: true,
    relatedLinks: [
      { label: "Report a dog", href: "/rescue" },
      { label: "Learn safe first steps", href: "/learn/how-to-help-a-stray-dog-safely" },
    ],
  },
  {
    id: "illustrative-a-careful-handoff",
    slug: "a-careful-handoff",
    title: "A careful handoff starts with useful details",
    excerpt:
      "A practical example of how location, observations, and a calm handoff can support a response.",
    body: `Illustrative community-care scenario — no real rescue or outcome is being described. A person asking for help can make a handoff easier by sharing an exact location, a safe way to reach them, and a short description of what they observed. A photo taken from a safe distance may help, but it is never worth stepping into traffic or approaching a frightened dog.\n\nThe person receiving a report should be able to ask questions and explain what they can do. If there is no immediate response, contact a qualified local service rather than assuming that someone else has taken over. Keep private contact details out of public posts.`,
    imageUrl: illustrativeDogPhotos.resting,
    illustrative: true,
    relatedLinks: [
      { label: "Send a rescue report", href: "/rescue" },
      { label: "Contact the team", href: "/contact" },
    ],
  },
  {
    id: "illustrative-a-shared-water-point",
    slug: "a-shared-water-point",
    title: "A shared water point works best with a routine",
    excerpt:
      "An educational example of keeping a neighborhood water stop clean, safe, and considerate.",
    body: `Illustrative community-care scenario — this is not a record of a particular neighborhood or dog. A clean bowl of water can be a simple way to help, but its location matters. Choose a stable, shaded place that does not obstruct a footpath, doorway, or vehicle entrance, and follow local rules.\n\nA routine keeps the area safer for dogs and neighbors: refresh the water, wash the bowl, and remove it if it becomes a hazard. Coordinating with nearby residents can prevent duplicated effort and make it easier to notice when a dog needs qualified help.`,
    imageUrl: illustrativeDogPhotos.outdoors,
    illustrative: true,
    relatedLinks: [
      { label: "Read feeding guidance", href: "/learn/responsible-street-dog-feeding" },
      { label: "Volunteer", href: "/volunteer" },
    ],
  },
  {
    id: "illustrative-space-before-contact",
    slug: "space-before-contact",
    title: "Space can be the kindest first offer",
    excerpt:
      "A reminder that a dog's distance and pace matter when people are trying to help.",
    body: `Illustrative community-care scenario — it does not describe a real encounter. A dog who turns away, freezes, hides, or keeps moving may be asking for more space. Those signs can have different meanings in different situations, so avoid treating any one gesture as a complete diagnosis of the dog's mood.\n\nGive the dog a clear route to leave. Keep children and other animals at a distance, speak calmly, and do not corner or reach over the dog. If the dog needs assistance, share observations with a qualified responder who can advise on a safe next step.`,
    imageUrl: illustrativeDogPhotos.resting,
    illustrative: true,
    relatedLinks: [
      { label: "Read body-language guidance", href: "/learn/understanding-street-dog-body-language" },
      { label: "Ask for help", href: "/contact" },
    ],
  },
  {
    id: "illustrative-a-foster-bridge",
    slug: "a-foster-bridge",
    title: "A foster home is a bridge built around capacity",
    excerpt:
      "An educational scenario about matching temporary care with a household's time and space.",
    body: `Illustrative community-care scenario — no individual foster placement is being claimed. Before offering a temporary home, a household can talk through the length of the commitment, available space, resident animals, costs, and who will coordinate veterinary care. A realistic offer is more useful than a promise that cannot be sustained.\n\nA written plan can clarify supplies, safe separation, contact arrangements, and what to do if the animal's needs change. Foster care is collaborative; asking questions early protects both the household and the dog.`,
    imageUrl: illustrativeDogPhotos.outdoors,
    illustrative: true,
    relatedLinks: [
      { label: "Explore fostering", href: "/foster" },
      { label: "Read the foster guide", href: "/learn/how-to-become-a-dog-foster-volunteer" },
    ],
  },
  {
    id: "illustrative-a-thoughtful-adoption",
    slug: "a-thoughtful-adoption",
    title: "A thoughtful adoption begins with honest questions",
    excerpt:
      "A practical example of checking fit, household agreement, and long-term care before adopting.",
    body: `Illustrative community-care scenario — this is not a real adoption story or outcome. An interested household can start by discussing time, budget, housing rules, travel, and the responsibilities every family member will share. The goal is not to find a perfect home on paper; it is to understand whether the household can offer stable care.\n\nMeeting a dog should happen at a pace that is comfortable for everyone. Ask the care team about known needs and next steps, and arrange veterinary guidance for health questions. Adoption is a long-term commitment, not a quick solution to a difficult day.`,
    imageUrl: illustrativeDogPhotos.resting,
    illustrative: true,
    relatedLinks: [
      { label: "Explore adoption", href: "/adopt" },
      { label: "See published puppy profiles", href: "/puppies" },
    ],
  },
  {
    id: "illustrative-small-volunteer-tasks",
    slug: "small-volunteer-tasks",
    title: "Small, reliable tasks keep a care network moving",
    excerpt:
      "An educational scenario about offering specific skills and communicating clearly as a volunteer.",
    body: `Illustrative community-care scenario — it does not report actual volunteer activity. A person with limited time might offer one defined task, such as helping organize supplies, sharing a verified notice, or checking whether a scheduled handoff happened. Clear availability makes it easier for a coordinator to plan without relying on assumptions.\n\nBefore sharing photos or contact details, ask permission and consider the animal's safety. Follow the team's guidance, communicate if plans change, and choose tasks that fit your capacity. Consistency can be more valuable than a large promise.`,
    imageUrl: illustrativeDogPhotos.outdoors,
    illustrative: true,
    relatedLinks: [
      { label: "Volunteer with the team", href: "/volunteer" },
      { label: "Read practical care guides", href: "/learn" },
    ],
  },
  {
    id: "illustrative-puppy-safety",
    slug: "puppy-safety-first",
    title: "Puppy safety begins with careful observation",
    excerpt:
      "An educational example of checking the surroundings and asking for qualified advice before intervening.",
    body: `Illustrative community-care scenario — no real litter, intervention, or outcome is being described. When puppies are seen outdoors, first observe from a safe distance and consider whether an adult dog is nearby. Moving or separating puppies without a clear safety reason can create new risks.\n\nIf a puppy appears injured, cold, unresponsive, or exposed to immediate danger, contact a veterinarian or qualified local animal-care group for guidance. Share the location and visible facts, and do not give medication or attempt a procedure based on an online guess.`,
    imageUrl: illustrativeDogPhotos.resting,
    illustrative: true,
    relatedLinks: [
      { label: "Report a concern", href: "/rescue" },
      { label: "Read puppy safety guidance", href: "/learn/helping-puppies-stay-safe-on-the-streets" },
    ],
  },
  {
    id: "illustrative-follow-through",
    slug: "follow-through-is-care",
    title: "Follow-through is part of the help",
    excerpt:
      "A reminder to close the loop, protect privacy, and make the next responsibility clear.",
    body: `Illustrative community-care scenario — this is not an account of a completed rescue. After a report or handoff, a brief check-in can clarify whether further help is still needed. Share updates with the people coordinating the response, not as unverified claims on a public page.\n\nA clear next step might be waiting for qualified advice, arranging a safe meeting, or recording who will follow up and when. If the plan changes, say so early. Keeping expectations realistic helps people continue supporting dogs without promising outcomes that no one can guarantee.`,
    imageUrl: illustrativeDogPhotos.outdoors,
    illustrative: true,
    relatedLinks: [
      { label: "Contact the team", href: "/contact" },
      { label: "Find a way to help", href: "/volunteer" },
    ],
  },
];

export type LearnSection = {
  heading: string;
  paragraphs: string[];
};

export type LearnArticle = {
  slug: string;
  title: string;
  summary: string;
  imageUrl: string;
  readingMinutes: number;
  sections: LearnSection[];
  relatedLinks: RelatedLink[];
};

export const learnArticles: LearnArticle[] = [
  {
    slug: "how-to-help-a-stray-dog-safely",
    title: "How to Help a Stray Dog Safely",
    summary: "Start with observation, space, and the right local support—not a rushed approach.",
    imageUrl: illustrativeDogPhotos.outdoors,
    readingMinutes: 4,
    sections: [
      {
        heading: "Pause and assess the setting",
        paragraphs: [
          "Look for traffic, other animals, nearby people, and a safe place where you can stand. Keep an open route for the dog to move away. A dog who is resting or walking calmly may not need a stranger to approach.",
          "If the dog is in immediate danger, contact a qualified local animal-care group or veterinarian. Do not put yourself in traffic or try to restrain a frightened animal.",
        ],
      },
      {
        heading: "Make contact optional",
        paragraphs: [
          "If the dog approaches voluntarily, stay sideways, move slowly, and avoid reaching over its head. Do not corner, chase, or force contact. Keep children and pets back until a qualified person has assessed the situation.",
          "A dog's behavior can change with pain, noise, fear, or unfamiliar surroundings. When in doubt, create space and ask for advice rather than interpreting a single signal as permission to touch.",
        ],
      },
      {
        heading: "Share useful facts",
        paragraphs: [
          "Write down the exact location, time, and visible details. A photo is optional and should only be taken from a safe distance. Distinguish what you observed from what you think might be happening.",
          "Use the rescue-report form to pass on details, then follow the guidance of local professionals. Avoid giving medicine or attempting treatment without veterinary direction.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Report a dog", href: "/rescue" },
      { label: "Contact the team", href: "/contact" },
    ],
  },
  {
    slug: "what-to-do-when-you-find-an-injured-street-dog",
    title: "What to Do When You Find an Injured Street Dog",
    summary: "Protect your own safety, document what you can see, and contact qualified help promptly.",
    imageUrl: illustrativeDogPhotos.resting,
    readingMinutes: 4,
    sections: [
      {
        heading: "Keep the scene safe",
        paragraphs: [
          "Do not step into traffic or crowd the dog. Give it room to move, and keep bystanders, children, and other animals at a distance. If the area itself is unsafe, move yourself to a safer place before making calls.",
          "An injured dog may react unpredictably, even if it is usually friendly. Do not attempt to lift, muzzle, or transport the dog unless a qualified professional has advised you how to do so safely.",
        ],
      },
      {
        heading: "Contact veterinary or rescue support",
        paragraphs: [
          "Share the precise location, a way to reach you, and a brief description of the visible concern. Say whether the dog is near traffic or another immediate hazard. A photo from a safe distance can help responders identify the right place.",
          "For severe or urgent concerns, contact a veterinarian or local emergency animal-care service directly. SaveStreet Dogs can receive reports, but a form is not a substitute for urgent professional care.",
        ],
      },
      {
        heading: "Avoid unqualified treatment",
        paragraphs: [
          "Do not give human medication, apply a product, or try to clean or close a wound based on an online suggestion. A veterinarian should decide what examination or treatment is appropriate.",
          "If you receive instructions, repeat them back to confirm you understood. Share updates with the responder and avoid posting identifying details or unverified claims publicly.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Send a rescue report", href: "/rescue" },
      { label: "Read safe-help guidance", href: "/learn/how-to-help-a-stray-dog-safely" },
    ],
  },
  {
    slug: "responsible-street-dog-feeding",
    title: "Responsible Street Dog Feeding",
    summary: "A considerate feeding routine supports dogs while keeping shared spaces clean and safe.",
    imageUrl: illustrativeDogPhotos.outdoors,
    readingMinutes: 4,
    sections: [
      {
        heading: "Choose a suitable place and time",
        paragraphs: [
          "Follow local rules and choose a spot away from traffic, entrances, school routes, and places where food could create a hazard. If neighbors share the space, a calm conversation can prevent misunderstandings.",
          "Regular timing helps volunteers plan and makes it easier to notice changes. Do not feed a dog in a way that forces it to cross a busy road or compete in a crowded area.",
        ],
      },
      {
        heading: "Keep the area clean",
        paragraphs: [
          "Use clean bowls, provide fresh water, and remove leftovers and disposable packaging. Wash reusable bowls regularly and avoid leaving food where it attracts pests or blocks public access.",
          "If the dog does not approach, leave it space. Do not use food to lure an unfamiliar or frightened dog close enough to touch.",
        ],
      },
      {
        heading: "Coordinate and ask when unsure",
        paragraphs: [
          "Where possible, coordinate with other caregivers so dogs are not fed repeatedly at the same time and concerns can be noticed early. Record observable changes and share them with a qualified local animal-care group.",
          "Dietary questions and health concerns belong with a veterinarian. Do not change an animal's care plan or introduce supplements based on social-media advice.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Volunteer", href: "/volunteer" },
      { label: "Explore community-care stories", href: "/stories" },
    ],
  },
  {
    slug: "understanding-street-dog-body-language",
    title: "Understanding Street Dog Body Language",
    summary: "Read behavior in context, give dogs room to choose, and avoid assuming one gesture tells the whole story.",
    imageUrl: illustrativeDogPhotos.resting,
    readingMinutes: 5,
    sections: [
      {
        heading: "Watch the whole picture",
        paragraphs: [
          "Notice the dog's posture, movement, surroundings, and changes over time. Turning away, becoming still, moving off, or seeking cover can mean the dog wants more distance, but no single signal explains every situation.",
          "Pain, noise, unfamiliar people, and nearby animals may affect behavior. Keep an open path and let the dog decide whether to remain nearby.",
        ],
      },
      {
        heading: "Make your own behavior predictable",
        paragraphs: [
          "Move slowly, keep your body relaxed, and avoid leaning over or staring directly at an unfamiliar dog. Do not chase, corner, or reach for the animal. Keep children and pets at a respectful distance.",
          "If a dog approaches, that does not automatically mean it wants to be touched. Allow it to leave, and ask an experienced local caregiver for help when you are unsure.",
        ],
      },
      {
        heading: "Choose safety over interpretation",
        paragraphs: [
          "Online body-language guides cannot assess an individual dog at a particular moment. If the dog seems distressed or is in danger, share what you observed with a veterinarian or qualified animal-care group.",
          "Avoid describing a dog as safe or aggressive based on one brief encounter. Clear, factual observations help professionals make a more careful assessment.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Learn how to help safely", href: "/learn/how-to-help-a-stray-dog-safely" },
      { label: "Ask for support", href: "/contact" },
    ],
  },
  {
    slug: "why-vaccination-and-sterilization-matter",
    title: "Why Vaccination and Sterilization Matter",
    summary: "Learn how veterinary-led prevention can support animal and community health over time.",
    imageUrl: illustrativeDogPhotos.outdoors,
    readingMinutes: 4,
    sections: [
      {
        heading: "Prevention is community care",
        paragraphs: [
          "Vaccination can help reduce the spread of certain serious diseases, while sterilization programs can help manage future litters humanely. Both require planning and qualified veterinary care.",
          "The right approach depends on local laws, the dog's condition, and available services. A veterinarian or authorized animal-welfare organization can explain what is appropriate in your area.",
        ],
      },
      {
        heading: "Look for qualified programs",
        paragraphs: [
          "Ask who provides the care, how animals are identified and monitored, and whom to contact if a concern arises. Responsible programs communicate clearly and follow local veterinary standards.",
          "Do not attempt vaccination, surgery, or medication yourself. Avoid sharing unverified schedules or making promises about a dog's health based on a single observation.",
        ],
      },
      {
        heading: "Share information carefully",
        paragraphs: [
          "If you know about an authorized local clinic or program, share its verified contact details. If you are reporting a particular dog, provide observable facts and let the care team determine eligibility and next steps.",
          "Long-term prevention is coordinated work. A conversation with a qualified professional is a better starting point than an online treatment plan.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Report a dog", href: "/rescue" },
      { label: "Volunteer", href: "/volunteer" },
    ],
  },
  {
    slug: "how-to-adopt-a-rescue-dog",
    title: "How to Adopt a Rescue Dog",
    summary: "A thoughtful adoption starts with household agreement, realistic capacity, and an open conversation.",
    imageUrl: illustrativeDogPhotos.resting,
    readingMinutes: 5,
    sections: [
      {
        heading: "Check that the timing works",
        paragraphs: [
          "Talk with everyone who will share care. Consider work schedules, housing rules, travel, ongoing costs, and the time available for settling in. A rescue dog may need patient routines and veterinary follow-up.",
          "If the household is not ready, volunteering or fostering may be a better next step. There is no benefit in rushing a decision that affects a dog for years.",
        ],
      },
      {
        heading: "Ask clear questions",
        paragraphs: [
          "Ask the care team what is known about the dog's routine, health records, and support needs. Unknown details should remain unknown until a qualified person can assess them.",
          "Arrange introductions at a pace that gives the dog room to settle. A profile is a starting point, not a guarantee about behavior in a new environment.",
        ],
      },
      {
        heading: "Plan for ongoing care",
        paragraphs: [
          "Identify a veterinarian, prepare a quiet resting area, and agree on household routines before bringing a dog home. Ask the care team about the process and which documents or follow-up steps are required.",
          "Adoption is a long-term commitment. If you have questions about current profiles, contact the team rather than assuming that an animal is available.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Explore adoption", href: "/adopt" },
      { label: "View published puppy profiles", href: "/puppies" },
    ],
  },
  {
    slug: "preparing-your-home-for-an-adopted-dog",
    title: "Preparing Your Home for an Adopted Dog",
    summary: "A calm, predictable first space can help a new dog settle without pressure.",
    imageUrl: illustrativeDogPhotos.outdoors,
    readingMinutes: 4,
    sections: [
      {
        heading: "Set up a quiet area",
        paragraphs: [
          "Choose a comfortable place where the dog can rest and retreat. Prepare water, a suitable bed, and supplies recommended by the care team. Keep doors and gates secure and make sure everyone knows the household plan.",
          "Store cleaning products, medicines, small objects, and food that may be unsafe out of reach. Ask a veterinarian about specific household hazards or dietary questions.",
        ],
      },
      {
        heading: "Keep the first days predictable",
        paragraphs: [
          "Limit visitors and new experiences while the dog becomes familiar with the space. Use calm routines for meals, rest, and outdoor breaks, and let the dog approach people at its own pace.",
          "If there are children or other animals in the home, plan introductions carefully and supervise them. A qualified trainer or veterinarian can help if you need individualized advice.",
        ],
      },
      {
        heading: "Plan for support",
        paragraphs: [
          "Save the care team's contact information and arrange a veterinary check according to their guidance. Keep records of questions or changes you notice, and ask before changing a recommended routine.",
          "Settling in takes time. A quiet home and clear communication are more useful than expecting an immediate bond.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Read about adoption", href: "/learn/how-to-adopt-a-rescue-dog" },
      { label: "Contact the team", href: "/contact" },
    ],
  },
  {
    slug: "how-to-become-a-dog-foster-volunteer",
    title: "How to Become a Dog Foster Volunteer",
    summary: "Fostering works best when the commitment, support, and household limits are clear from the start.",
    imageUrl: illustrativeDogPhotos.resting,
    readingMinutes: 4,
    sections: [
      {
        heading: "Describe what you can offer",
        paragraphs: [
          "Think about the space, time, and supplies available in your home, along with resident animals, work schedules, and any housing restrictions. Be honest about dates and limits.",
          "A short, defined offer is helpful. The team can then discuss whether a particular foster need fits your capacity without asking you to make a promise you cannot keep.",
        ],
      },
      {
        heading: "Agree on responsibilities",
        paragraphs: [
          "Before a placement, clarify who supplies food and equipment, who arranges veterinary care, how updates are shared, and whom to contact if an issue comes up. Keep emergency contact information accessible.",
          "Follow the care team's guidance about separation, introductions, and routines. Do not introduce a foster dog to other animals or public settings without checking the plan.",
        ],
      },
      {
        heading: "Communicate early",
        paragraphs: [
          "Share changes in behavior or health promptly with the coordinator and a veterinarian when needed. Ask before posting photos or details that could identify a person or location.",
          "Fostering is a team effort. Clear boundaries, reliable updates, and a safe place to rest help make the experience more manageable.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Apply to foster", href: "/foster" },
      { label: "Volunteer", href: "/volunteer" },
    ],
  },
  {
    slug: "helping-puppies-stay-safe-on-the-streets",
    title: "Helping Puppies Stay Safe on the Streets",
    summary: "Observe carefully, keep the area calm, and ask qualified local help before moving puppies.",
    imageUrl: illustrativeDogPhotos.outdoors,
    readingMinutes: 4,
    sections: [
      {
        heading: "Observe without disturbing",
        paragraphs: [
          "If you see puppies outdoors, first look for an adult dog from a safe distance. Do not assume that puppies have been abandoned because an adult is not visible for a short time.",
          "Keep people, traffic, and pets back where possible. Avoid handling, separating, or moving the puppies unless there is an immediate safety concern and a qualified responder has advised you.",
        ],
      },
      {
        heading: "Ask for qualified guidance",
        paragraphs: [
          "If a puppy appears injured, cold, or exposed to immediate danger, contact a veterinarian or local animal-care organization. Give the exact location and explain only what you can directly observe.",
          "Do not give medication, food, or home remedies to very young animals without professional guidance. A veterinarian can advise on age-appropriate care and safe next steps.",
        ],
      },
      {
        heading: "Protect privacy and keep updates factual",
        paragraphs: [
          "Share location details with the people coordinating care, but avoid posting a precise nest location publicly if doing so could attract unsafe attention. Ask permission before sharing anyone's contact details or photographs.",
          "If the situation changes, provide a factual update to the responder. Do not promise a rescue or outcome before a qualified person has assessed the circumstances.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Report a concern", href: "/rescue" },
      { label: "Read injured-dog guidance", href: "/learn/what-to-do-when-you-find-an-injured-street-dog" },
    ],
  },
];
