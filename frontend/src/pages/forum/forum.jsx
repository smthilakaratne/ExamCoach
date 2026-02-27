import { Flame, MessageSquare, Search, Tag } from "lucide-react"
import { Link } from "react-router-dom"
import Button from "../../components/button"
import ForumThread from "../../components/forumThread"
import ForumTag from "../../components/tag"
import Container from "../../components/container"
import { useState } from "react"
import { useEffect } from "react"
import { getForumTags } from "../../services/forumApi"

const { VITE_API_URL } = import.meta.env

const user = { name: "Sample user" }

export default function Forum() {
  const [threads, setThreads] = useState([])
  const [tags, setTags] = useState([])
  const [viewMode, setViewMode] = useState("trending")

  const views = {
    trending: () => threads, // return all for now
    latest: () =>
      [...threads].sort(
        (t1, t2) => new Date(t2.createdAt) - new Date(t1.createdAt),
      ),
    unanswered: () => threads.filter((thread) => thread.answers.length === 0),
    "my-questions": () => threads, // everything is sample user for now
    "my-answers": () => threads, // everything is sample user for now
  }

  const hotTodayQuestions = threads?.slice(0, 3) ?? []
  const filteredThreads = views[viewMode]()

  useEffect(() => {
    ;(async () => {
      const response = await fetch(`${VITE_API_URL}/api/forum`)
      const result = await response.json()
      setThreads(result?.body ?? [])
    })()
  }, [])

  useEffect(() => {
    getForumTags().then(setTags)
  }, [])

  return (
    <main className="m-4">
      <section className="flex gap-2 justify-between items-center">
        <input
          type="search"
          className="ring-1 ring-gray-300 px-4 py-2 rounded-sm flex-auto"
        />
        <Button className="flex gap-2 items-center">
          <Search className="size-5" />
          <span>Search</span>
        </Button>
      </section>

      <div className="flex gap-3 justify-between my-3">
        <section className="flex-auto">
          <div className="flex justify-between items-center">
            <h3 className="text-xl my-3">{threads.length} questions</h3>
            <div className="flex gap-1 border border-gray-300 rounded-sm p-1">
              <Button
                kind={viewMode === "trending" ? "primary" : "secondary"}
                className="border-0 text-sm"
                onClick={() => setViewMode("trending")}
              >
                Trending
              </Button>
              <Button
                kind={viewMode === "latest" ? "primary" : "secondary"}
                className="border-0 text-sm"
                onClick={() => setViewMode("latest")}
              >
                Latest
              </Button>
              <Button
                kind={viewMode === "unanswered" ? "primary" : "secondary"}
                className="border-0 text-sm"
                onClick={() => setViewMode("unanswered")}
              >
                Unanswered
              </Button>
              <Button
                kind={viewMode === "my-questions" ? "primary" : "secondary"}
                className="border-0 text-sm"
                onClick={() => setViewMode("my-questions")}
              >
                My Questions
              </Button>
              <Button
                kind={viewMode === "my-answers" ? "primary" : "secondary"}
                className="border-0 text-sm"
                onClick={() => setViewMode("my-answers")}
              >
                My Answers
              </Button>
            </div>
          </div>

          <section>
            {filteredThreads.length === 0 ? (
              <p className="font-light text-sm text-gray-500 my-5">
                It's quite here... <Link to="./new">Start a new question</Link>{" "}
                and shake things up
              </p>
            ) : (
              <>
                {filteredThreads.map((thread, index) => (
                  <ForumThread key={`thread-${index}`} {...thread} />
                ))}
              </>
            )}
          </section>
        </section>

        <section className="border-l border-l-gray-300 pl-6 py-5 max-w-md">
          <Link to="new">
            <Button className="w-full">Ask question</Button>
          </Link>
          <section>
            <h3 className="text-xl my-3 font-bold flex gap-2 items-center">
              <Flame className="text-orange-400" />
              <span>Hot today</span>
            </h3>
            {hotTodayQuestions.length <= 0 ? (
              <p className="font-light text-sm text-gray-500">
                No sparks flying today.{" "}
                <Link to="./new">Start a new topic</Link> and light it up.
              </p>
            ) : (
              <>
                {hotTodayQuestions.slice(0, 3).map((thread) => (
                  <Link to={`./${thread._id}`}>
                    <Container className="cursor-pointer hover:bg-gray-200 transition-colors">
                      <h5 className="font-bold">{thread.title}</h5>
                      <div className="flex gap-1 items-center text-xs text-gray-500 mt-3">
                        <MessageSquare className="size-4" />
                        <span>{thread?.answers?.length ?? 0}</span>
                      </div>
                    </Container>
                  </Link>
                ))}
              </>
            )}
          </section>
          <section className="pt-3 mt-6 border-t border-t-gray-300">
            <h3 className="text-xl my-3 font-bold flex gap-2 items-center">
              <Tag className="text-gray-400" />
              <span>Explore tags</span>
            </h3>
            <div className="flex flex-wrap gap-2 my-4">
              {tags
                .map((tag) => tag.name)
                .slice(0, 10)
                .map((tag, index) => (
                  <ForumTag
                    key={`tag-${index}`}
                    name={tag}
                    className="cursor-pointer hover:bg-gray-400"
                  />
                ))}
            </div>
            <Link to="./tags">Explore more tags</Link>
          </section>
        </section>
      </div>
    </main>
  )
}
