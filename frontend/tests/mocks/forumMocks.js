export async function mockGetThread(page) {
  await page.route("*/**/api/forum/*", (route) => {
    route.fulfill({
      response: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        statusMessage: "OK",
        body: {
          thread: {
            reactions: {
              up: [],
              down: [],
            },
            _id: "0000000000000",
            title: "Sample title",
            body: "Sample description",
            tags: [],
            createdBy: {
              _id: "0000000000000",
              name: "User",
              email: "user@gmail.com",
              avatar: "",
            },
            views: 1,
            answers: [],
            createdAt: "2026-03-11T07:39:04.332Z",
            updatedAt: "2026-03-11T07:39:05.989Z",
            __v: 0,
          },
        },
      }),
    })
  })
}

export async function mockCreateThread(page) {
  await page.route("*/**/api/forum", (route) => {
    if (route.request().method() === "POST")
      return route.fulfill({
        response: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          statusMessage: "Created",
          body: {
            thread: {
              reactions: {
                up: [],
                down: [],
              },
              _id: "0000000000000",
              title: "Sample title",
              body: "Sample description",
              tags: [],
              createdBy: {
                _id: "0000000000000",
                name: "User",
                email: "user@gmail.com",
                avatar: "",
              },
              views: 1,
              answers: [],
              createdAt: "2026-03-11T07:39:04.332Z",
              updatedAt: "2026-03-11T07:39:05.989Z",
              __v: 0,
            },
          },
        }),
      })
    route.continue()  
  })
}
