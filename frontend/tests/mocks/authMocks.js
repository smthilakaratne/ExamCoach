export async function mockUserLogin(page) {
  await page.route("**/api/auth/login", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        statusMessage: "OK",
        body: {
          message: "Login successful",
          token: "mock-token",
          user: {
            id: "000000000000000",
            name: "user",
            email: "user@gmail.com",
            role: "user",
            avatar: "",
          },
        },
      }),
    })
  })
}

export async function mockAdminLogin(page) {
  await page.route("**/api/auth/login", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        statusMessage: "OK",
        body: {
          message: "Login successful",
          token: "mock-token",
          user: {
            id: "000000000000001",
            name: "admin",
            email: "admin@gmail.com",
            role: "admin",
            avatar: "",
          },
        },
      }),
    })
  })
}
