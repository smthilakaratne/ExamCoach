export async function mockForumTags(page) {
  await page.route("*/**/api/forum/tags", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        statusMessage: "OK",
        body: {
          tags: [
            {
              _id: "699ea687cbb4b50eec8de670",
              name: "business-studies",
              description:
                "Management, marketing, entrepreneurship, and organizational behavior.",
            },
            {
              _id: "699ea687cbb4b50eec8de66d",
              name: "geography",
              description:
                "Physical geography, human geography, and environmental studies.",
            },
            {
              _id: "699ea687cbb4b50eec8de672",
              name: "law",
              description:
                "Constitutional law, criminal law, and legal principles.",
            },
            {
              _id: "699ea687cbb4b50eec8de673",
              name: "general-knowledge",
              description:
                "Current affairs, global events, and miscellaneous topics.",
            },
            {
              _id: "699ea687cbb4b50eec8de669",
              name: "physics",
              description:
                "Mechanics, thermodynamics, electromagnetism, and modern physics.",
            },
            {
              _id: "699ea687cbb4b50eec8de671",
              name: "english",
              description:
                "Grammar, literature, comprehension, and essay writing.",
            },
            {
              _id: "699ea687cbb4b50eec8de66b",
              name: "biology",
              description:
                "Cell biology, genetics, evolution, and human biology.",
            },
            {
              _id: "699ea687cbb4b50eec8de66a",
              name: "chemistry",
              description:
                "Organic, inorganic, physical chemistry, and chemical reactions.",
            },
            {
              _id: "699ea687cbb4b50eec8de66f",
              name: "accounting",
              description:
                "Financial accounting, managerial accounting, and auditing.",
            },
            {
              _id: "699ea687cbb4b50eec8de668",
              name: "mathematics",
              description:
                "Algebra, calculus, statistics, and discrete mathematics.",
            },
            {
              _id: "699ea687cbb4b50eec8de66e",
              name: "economics",
              description:
                "Microeconomics, macroeconomics, and economic theory.",
            },
            {
              _id: "699ea687cbb4b50eec8de66c",
              name: "history",
              description: "Ancient, medieval, and modern world history.",
            },
            {
              _id: "69a197805ec44b22887d1d21",
              name: "religion",
              description: "The study about religions",
              __v: 0,
            },
          ],
        },
      }),
    })
  })
}
